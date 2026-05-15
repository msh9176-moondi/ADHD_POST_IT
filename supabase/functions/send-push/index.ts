import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

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

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const now = new Date()

  // push_subscriptions가 있는 유저 중 최근 nfc_logs 기준으로 미태깅 일수 계산
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')

  if (!subs || subs.length === 0) {
    return new Response('no subscriptions', { status: 200 })
  }

  let sent = 0
  const errors: string[] = []

  for (const sub of subs) {
    // 해당 유저의 마지막 NFC 태깅 날짜 조회
    const { data: lastLog } = await supabase
      .from('nfc_logs')
      .select('accessed_at')
      .eq('user_id', sub.user_id)
      .order('accessed_at', { ascending: false })
      .limit(1)
      .single()

    let daysSince: number
    if (!lastLog) {
      // 태깅 기록 자체가 없으면 가입 이후 3일 이상 경과한 경우만
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
        JSON.stringify({ ...message, url: '/nfc' })
      )
      sent++
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${sub.user_id}: ${msg}`)

      // 410 Gone = 구독 만료 → 삭제
      if (msg.includes('410')) {
        await supabase.from('push_subscriptions')
          .delete()
          .eq('user_id', sub.user_id)
          .eq('endpoint', sub.endpoint)
      }
    }
  }

  return new Response(JSON.stringify({ sent, errors }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
