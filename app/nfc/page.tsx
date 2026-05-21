'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/layout/AppShell'

async function savePushSubscription(sub: PushSubscription) {
  const json = sub.toJSON()
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
  })
}

function NfcHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isFromTag = searchParams.get('src') === 'tag'

  useEffect(() => {
    if (!isFromTag) {
      router.replace('/grounding')
      return
    }

    async function handle() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        try {
          await supabase.from('nfc_logs').insert({
            user_id: user.id,
            accessed_at: new Date().toISOString(),
            reward_given: false,
          })

          // 알림 권한 없으면 백그라운드로 요청
          if ('Notification' in window && Notification.permission === 'default') {
            const { requestAndSubscribe } = await import('@/lib/push/subscribe')
            const sub = await requestAndSubscribe()
            if (sub) await savePushSubscription(sub)
          }
        } catch {
          // XP 실패해도 계획 화면으로는 이동
        }
      }

      router.replace('/grounding')
    }

    handle()
  }, [])

  return (
    <AppShell>
      <div className="flex min-h-screen justify-center items-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </AppShell>
  )
}

export default function NfcPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex min-h-screen justify-center items-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    }>
      <NfcHandler />
    </Suspense>
  )
}
