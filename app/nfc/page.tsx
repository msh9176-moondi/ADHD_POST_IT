'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { grantXP } from '@/lib/xp/reward'
import { requestAndSubscribe } from '@/lib/push/subscribe'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type Status = 'loading' | 'success' | 'already_rewarded' | 'error' | 'unauthenticated'

async function savePushSubscription(sub: PushSubscription) {
  const json = sub.toJSON()
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
  })
}

// NFC 태그를 실제로 찍었을 때 (/nfc?src=tag) 실행되는 컴포넌트
function NfcTagHandler() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')
  const [showPushPrompt, setShowPushPrompt] = useState(false)

  useEffect(() => {
    async function handleNfcEntry() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setStatus('unauthenticated')
        return
      }

      try {
        await supabase.from('nfc_logs').insert({
          user_id: user.id,
          accessed_at: new Date().toISOString(),
          reward_given: false,
        })

        const result = await grantXP(supabase, user.id, 'nfc_tag')
        setXpGranted(result.granted)

        if (result.granted) {
          await supabase
            .from('nfc_logs')
            .update({ reward_given: true })
            .eq('user_id', user.id)
            .order('accessed_at', { ascending: false })
            .limit(1)
        }

        setStatus(result.granted ? 'success' : 'already_rewarded')

        // 알림 권한이 아직 없는 경우 프롬프트 표시
        if ('Notification' in window && Notification.permission === 'default') {
          setShowPushPrompt(true)
        }
      } catch {
        setStatus('error')
      }
    }

    handleNfcEntry()
  }, [])

  async function handleEnableNotification() {
    setShowPushPrompt(false)
    const sub = await requestAndSubscribe()
    if (sub) await savePushSubscription(sub)
  }

  // xpGranted는 status에서 파생
  const [, setXpGranted] = useState(false)

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col min-h-screen py-8 justify-center items-center text-center space-y-6">
        <div className="text-5xl">👋</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">로그인이 필요해요</h1>
          <p className="text-slate-500">XP 보상을 받으려면 로그인해주세요</p>
        </div>
        <div className="w-full space-y-3">
          <Link href="/auth/login" className="block w-full py-4 px-6 text-lg font-semibold text-center text-slate-800 bg-amber-400 rounded-full shadow-md hover:bg-amber-500 transition-all">
            로그인하러 가기
          </Link>
          <Link href="/brain-dump" className="block w-full py-4 px-6 text-lg font-semibold text-center text-slate-600 bg-white rounded-full border-2 border-slate-200 hover:border-amber-300 transition-all">
            로그인 없이 계속하기
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500">NFC 태깅 처리 중...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen py-8">
      <div className="text-center space-y-4 mb-8 animate-fade-in">
        <div className="text-6xl animate-bounce-gentle">
          {status === 'success' ? '🏷️' : status === 'already_rewarded' ? '👍' : '⚡'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">NFC 태깅 성공</h1>
          <p className="text-slate-500 mt-1">오늘의 계획 작성으로 돌아왔어요.</p>
        </div>
      </div>

      <div className="space-y-4 mb-8 animate-slide-up">
        {status === 'success' && (
          <Card variant="highlight">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <div>
                <p className="font-bold text-amber-700 text-lg">+10 XP 획득!</p>
                <p className="text-sm text-slate-500">오늘 첫 NFC 태깅 보상이에요</p>
              </div>
            </div>
          </Card>
        )}

        {/* 알림 권한 프롬프트 */}
        {showPushPrompt && (
          <div className="bg-slate-800 rounded-2xl p-4 animate-fade-in">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-xl flex-shrink-0">🔔</span>
              <div>
                <p className="text-sm font-semibold text-white">태깅을 잊지 않게 알려드릴까요?</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">며칠 태깅을 못 해도 괜찮아요.<br />복귀 신호를 보내드릴게요.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEnableNotification}
                className="flex-1 py-2 text-sm font-semibold bg-amber-400 text-slate-900 rounded-xl hover:bg-amber-500 transition-all"
              >
                알림 받기
              </button>
              <button
                onClick={() => setShowPushPrompt(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-all"
              >
                나중에
              </button>
            </div>
          </div>
        )}

        {status === 'already_rewarded' && (
          <Card>
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <p className="text-sm text-slate-500 leading-relaxed">
                오늘 NFC 보상은 이미 받았어요.<br />
                그래도 계획 작성은 계속할 수 있어요.
              </p>
            </div>
          </Card>
        )}

        <Card>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">오늘도 돌아왔네요 ✨</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              포스트잇을 태깅한다는 것은<br />
              다시 시작하겠다는 신호예요.<br />
              <strong className="text-slate-700">완료가 아니라 복귀가 목표입니다.</strong>
            </p>
          </div>
        </Card>

        <div className="bg-amber-300/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm font-medium text-slate-700">매일 태깅하면 스트릭이 쌓여요</p>
            <p className="text-xs text-slate-500">연속 태깅 보너스 최대 +30 XP</p>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-3 safe-bottom">
        <Button onClick={() => router.push('/brain-dump')}>
          오늘 계획 만들기
        </Button>
        <Button variant="secondary" onClick={() => router.push('/profile')}>
          내 성장 기록 보기
        </Button>
      </div>
    </div>
  )
}

// 네비게이션 바로 직접 접근했을 때 보여주는 안내 화면
function NfcInfoView() {
  const router = useRouter()

  return (
    <div className="flex flex-col py-8 animate-fade-in">
      <div className="space-y-1 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">NFC 태깅</h1>
        <p className="text-sm text-slate-500">포스트잇 뒷면에 붙어있는 NFC 스티커를 활용해요</p>
      </div>

      <div className="space-y-4">
        <Card variant="highlight">
          <div className="space-y-3">
            <p className="text-sm font-bold text-amber-700">어떻게 사용하나요?</p>
            <ol className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-500 flex-shrink-0">1.</span>
                <span>포스트잇을 눈에 잘 띄는 곳에 붙여두세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-500 flex-shrink-0">2.</span>
                <span>계획을 시작하기 전, 핸드폰을 포스트잇 뒷면에 갖다 대세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-500 flex-shrink-0">3.</span>
                <span>태깅하면 XP를 받고, 오늘의 계획으로 바로 이동해요</span>
              </li>
            </ol>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">💡</span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700">태깅이 시작 신호예요</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                핸드폰을 갖다 대는 그 순간이<br />
                오늘 계획을 실행하겠다는 선언이에요.<br />
                완료가 아니라 <strong className="text-slate-700">복귀가 목표</strong>입니다.
              </p>
            </div>
          </div>
        </Card>

        <div className="bg-amber-300/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm font-medium text-slate-700">매일 태깅하면 스트릭이 쌓여요</p>
            <p className="text-xs text-slate-500">하루 1회 +10 XP · 연속 보너스 최대 +30 XP</p>
          </div>
        </div>
      </div>

      <div className="mt-8 safe-bottom">
        <Button onClick={() => router.push('/brain-dump')}>
          오늘 계획 만들기
        </Button>
      </div>
    </div>
  )
}

function NfcPageInner() {
  const searchParams = useSearchParams()
  const isFromTag = searchParams.get('src') === 'tag'

  return (
    <AppShell>
      {isFromTag ? <NfcTagHandler /> : <NfcInfoView />}
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
      <NfcPageInner />
    </Suspense>
  )
}
