import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

function getMessage(daysSince: number): { title: string; body: string } | null {
  if (daysSince >= 14) return {
    title: '10분 포스트잇',
    body: '오랜만이에요. 처음부터 다시가 아니라 지금부터 다시예요.',
  }
  if (daysSince >= 7) return {
    title: '10분 포스트잇',
    body: '돌아오는 것 자체가 실행력이에요. 지금 딱 한 번만요.',
  }
  if (daysSince >= 3) return {
    title: '10분 포스트잇',
    body: '잠깐 쉬었군요. 괜찮아요. NFC 한 번만 찍어볼까요? 10분만.',
  }
  return null
}

function isAuthorized(req: NextRequest): boolean {
  // Vercel cron: Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true
  // 수동 호출: x-cron-secret 헤더
  return req.headers.get('x-cron-secret') === process.env.CRON_SECRET
}

export async function GET(req: NextRequest) {
  return POST(req)
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')

  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const now = new Date()
  let sent = 0

  for (const sub of subs) {
    const { data: lastLog } = await supabase
      .from('nfc_logs')
      .select('accessed_at')
      .eq('user_id', sub.user_id)
      .order('accessed_at', { ascending: false })
      .limit(1)
      .single()

    let daysSince: number
    if (!lastLog) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', sub.user_id)
        .single()
      if (!profile) continue
      daysSince = Math.floor((now.getTime() - new Date(profile.created_at).getTime()) / 86400000)
    } else {
      daysSince = Math.floor((now.getTime() - new Date(lastLog.accessed_at).getTime()) / 86400000)
    }

    const message = getMessage(daysSince)
    if (!message) continue

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ ...message, url: '/nfc' }),
      )
      sent++
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // 구독 만료(410) → 자동 삭제
      if (msg.includes('410') || msg.includes('StatusCode: 410')) {
        await supabase.from('push_subscriptions')
          .delete()
          .eq('user_id', sub.user_id)
          .eq('endpoint', sub.endpoint)
      }
    }
  }

  return NextResponse.json({ sent })
}
