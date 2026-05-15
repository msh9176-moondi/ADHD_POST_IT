'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { grantXP } from '@/lib/xp/reward'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const LOADING_MESSAGES = [
  '머릿속 혼란을 정리하고 있어요...',
  '일정과 할 일을 분류하는 중이에요...',
  '오늘 실행 가능한 것들을 추려내고 있어요...',
  '감정 신호도 함께 살펴보고 있어요...',
]

export default function BrainDumpPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [userId, setUserId] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  useEffect(() => {
    setCharCount(content.length)
  }, [content])

  useEffect(() => {
    if (!loading) return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[i])
    }, 2000)
    return () => clearInterval(interval)
  }, [loading])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!content.trim() || loading) return

    setLoading(true)

    try {
      const supabase = createClient()
      let brainDumpId: string | null = null

      // Save brain dump if logged in
      if (userId) {
        const { data } = await supabase
          .from('brain_dumps')
          .insert({ user_id: userId, content: content.trim() })
          .select('id')
          .single()
        brainDumpId = data?.id ?? null
      }

      // Call classify AI API
      const response = await fetch('/api/classify-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brainDump: content.trim() }),
      })

      if (!response.ok) {
        throw new Error('AI 분류 중 문제가 발생했어요')
      }

      const classifyResult = await response.json()

      // Grant XP if logged in
      if (userId) {
        await grantXP(supabase, userId, 'brain_dump')
      }

      // 새 세션 시작 — 이전 계획 데이터와 저장 상태 초기화
      const today = new Date().toISOString().slice(0, 10)
      sessionStorage.removeItem(`planSaved_${today}`)
      sessionStorage.removeItem('postitItems')
      sessionStorage.removeItem('selectedTasks')
      sessionStorage.removeItem('taskPriorities')
      sessionStorage.removeItem('currentTaskIndex')

      // Store in sessionStorage
      sessionStorage.setItem('classifyResult', JSON.stringify(classifyResult))
      sessionStorage.setItem('brainDumpId', brainDumpId ?? '')
      sessionStorage.setItem('brainDumpContent', content.trim())

      router.push('/task-select')
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const hints = [
    '해야 하는데 계속 미루는 것',
    '걱정되거나 막막한 것',
    '갑자기 생각난 아이디어',
    '오늘 꼭 처리해야 할 것',
    '그냥 머릿속에 맴도는 것',
  ]

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6">
        {/* Header */}
        <div className="space-y-2 mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">
              브레인 덤프
            </h1>
            {!userId && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                게스트 모드
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            정리하려고 하지 않아도 됩니다.
          </p>
          <p className="text-slate-600 text-base font-medium leading-relaxed">
            해야 할 일, 걱정, 미룬 것,<br />떠오르는 것을 전부 적어보세요.
          </p>
        </div>

        {/* Hint chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {hints.map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => setContent((prev) => prev ? `${prev}\n${hint}` : hint)}
              className="text-xs bg-white text-slate-500 border border-slate-200 rounded-full px-3 py-1.5 hover:border-amber-300 hover:text-amber-700 transition-all"
            >
              + {hint}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="예: 포트폴리오 해야 함, 사업계획서도 써야 함, 방 정리도 해야 함, 근데 너무 막막함…"
              className="w-full h-full min-h-[240px] px-4 py-4 rounded-2xl border-2 border-slate-200 text-slate-800 placeholder-slate-300 text-base leading-relaxed bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-300">
              {charCount}자
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <Card variant="highlight">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <p className="text-sm text-amber-700 font-medium transition-all">
                  {loadingMsg}
                </p>
              </div>
            </Card>
          )}

          {/* Tips */}
          {!loading && (
            <Card>
              <div className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">💡</span>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600">이렇게 적어도 괜찮아요</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    문장이 아니어도, 맞춤법이 틀려도 됩니다.<br />
                    &quot;모르겠음&quot;, &quot;너무 많음&quot; 같은 것도 좋아요.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Submit */}
          <div className="pt-2 safe-bottom">
            <Button
              type="submit"
              loading={loading}
              disabled={!content.trim()}
            >
              {loading ? loadingMsg : 'AI가 할 일 분류하기 ✨'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
