'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { grantXP } from '@/lib/xp/reward'
import { ConvertPlanResponse } from '@/types'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function PostitConfirmPage() {
  const router = useRouter()
  const [sentence, setSentence] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('aiResult')
    if (!stored) {
      router.replace('/brain-dump')
      return
    }
    const result = JSON.parse(stored) as ConvertPlanResponse
    setSentence(result.finalPostitSentence)
  }, [])

  async function handleConfirm() {
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Mark written_confirmed in the latest plan_sentence
        await supabase
          .from('plan_sentences')
          .update({ written_confirmed: true })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        // Grant postit_written XP
        await grantXP(supabase, user.id, 'postit_written')
      }

      setConfirmed(true)

      // Navigate after a brief celebration
      setTimeout(() => {
        router.push('/reward')
      }, 800)
    } finally {
      setLoading(false)
    }
  }

  if (!sentence) {
    return (
      <AppShell>
        <div className="flex min-h-screen justify-center items-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 animate-fade-in">
        {/* Header */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-slate-800">포스트잇 작성</h1>
          <p className="text-sm text-slate-500">마지막 단계예요</p>
        </div>

        {/* Post-it visual */}
        <div className="mb-6">
          <div className="relative">
            {/* Shadow post-it */}
            <div className="absolute inset-0 bg-amber-200 rounded-2xl translate-x-2 translate-y-2" />
            {/* Main post-it */}
            <div className="relative bg-amber-300 rounded-2xl p-8 shadow-postit">
              {/* Pin decoration */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-amber-500 rounded-full shadow-md flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-200 rounded-full" />
              </div>

              {/* Sentence */}
              <p className="text-slate-800 text-2xl font-bold leading-snug text-center min-h-[80px] flex items-center justify-center">
                {sentence}
              </p>

              {/* Date */}
              <p className="text-center text-amber-700 text-xs mt-4 opacity-70">
                {new Date().toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          <Card>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">✍️</span>
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-700">
                  이 문장을 포스트잇에 그대로 적어보세요.
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  손으로 쓰는 것이 오늘의 계획을<br />
                  눈앞에 고정하는 단계입니다.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="highlight">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                왜 손으로 써야 할까요?
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>직접 쓰면 기억에 훨씬 더 잘 남아요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>모니터 옆에 붙이면 &apos;시작 신호&apos;가 돼요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>작성 행위 자체가 실행 의도를 강화해요</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Confirmation state */}
        {confirmed && (
          <div className="text-center py-4 animate-bounce-gentle">
            <span className="text-4xl">🎉</span>
            <p className="font-bold text-slate-700 mt-2">완료! +20 XP</p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-auto space-y-3 safe-bottom">
          <Button
            onClick={handleConfirm}
            loading={loading}
            disabled={confirmed}
          >
            {confirmed ? '포스트잇 작성 완료! 🎉' : '포스트잇에 작성 완료'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/brain-dump')}
            disabled={loading || confirmed}
          >
            처음으로 돌아가기
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
