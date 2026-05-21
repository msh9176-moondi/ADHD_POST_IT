'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
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

// 칩 클릭 시 삽입되는 빈칸 템플릿 — 사용자가 콜론 뒤를 직접 채워야 함
const HINT_TEMPLATES = [
  { label: '미루는 것', template: '미루는 것: ' },
  { label: '걱정되는 것', template: '걱정되는 것: ' },
  { label: '오늘 할 것', template: '오늘 할 것: ' },
  { label: '떠오른 것', template: '떠오른 것: ' },
  { label: '막막한 것', template: '막막한 것: ' },
]

// 템플릿만 있고 실제 내용이 없으면 false
function hasRealContent(text: string): boolean {
  const lines = text.trim().split('\n').filter((l) => l.trim())
  return lines.some((line) => {
    const t = line.trim()
    if (t.endsWith(':') || t.endsWith(': ')) return false
    const colonIdx = t.indexOf(': ')
    if (colonIdx >= 0) return t.slice(colonIdx + 2).trim().length > 0
    return t.length > 0
  })
}

export default function BrainDumpPage() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!loading) return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[i])
    }, 2000)
    return () => clearInterval(interval)
  }, [loading])

  function addTemplate(template: string) {
    setContent((prev) => {
      const newContent = prev ? `${prev}\n${template}` : template
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newContent.length, newContent.length)
        }
      }, 0)
      return newContent
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!hasRealContent(content) || loading) return

    setLoading(true)

    try {
      const supabase = createClient()
      let brainDumpId: string | null = null

      if (userId) {
        const { data } = await supabase
          .from('brain_dumps')
          .insert({ user_id: userId, content: content.trim() })
          .select('id')
          .single()
        brainDumpId = data?.id ?? null
      }

      const response = await fetch('/api/classify-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brainDump: content.trim() }),
      })

      if (!response.ok) throw new Error('AI 분류 중 문제가 발생했어요')

      const classifyResult = await response.json()

      if (userId) {
        await grantXP(supabase, userId, 'brain_dump')
      }

      const today = new Date().toISOString().slice(0, 10)
      sessionStorage.removeItem(`planSaved_${today}`)
      sessionStorage.removeItem('postitItems')
      sessionStorage.removeItem('selectedTasks')
      sessionStorage.removeItem('taskPriorities')
      sessionStorage.removeItem('currentTaskIndex')
      sessionStorage.removeItem('energyLevel')

      sessionStorage.setItem('classifyResult', JSON.stringify(classifyResult))
      sessionStorage.setItem('brainDumpId', brainDumpId ?? '')
      sessionStorage.setItem('brainDumpContent', content.trim())

      router.push('/energy-select')
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const canSubmit = hasRealContent(content)

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6">
        {/* Header */}
        <div className="space-y-2 mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">브레인 덤프</h1>
            {!userId && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                게스트 모드
              </span>
            )}
          </div>
          <p className="text-slate-600 text-base font-medium leading-relaxed">
            지금 머릿속에 있는 것을 꺼내보세요.<br />
            <span className="text-amber-600">정리 안 해도 됩니다. 그냥 쏟아내세요.</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                '예시:\n미루는 것: 포트폴리오 3주째 손도 못 댔음\n걱정되는 것: 취업 어디서 시작해야 할지 모르겠음\n오늘 할 것: 친구한테 연락 답장해야 함'
              }
              className="w-full h-full min-h-[240px] px-4 py-4 rounded-2xl border-2 border-slate-200 text-slate-800 placeholder-slate-300 text-base leading-relaxed bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-300">
              {content.length}자
            </div>
          </div>

          {/* 주제 힌트 칩 */}
          {!loading && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium">
                뭘 써야 할지 모르겠다면, 아래 주제 중 하나를 탭하세요
              </p>
              <div className="flex flex-wrap gap-1.5">
                {HINT_TEMPLATES.map(({ label, template }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => addTemplate(template)}
                    className="text-xs bg-white text-slate-500 border border-slate-200 rounded-full px-3 py-1.5 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-all"
                  >
                    {label} →
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <Card variant="highlight">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <p className="text-sm text-amber-700 font-medium">{loadingMsg}</p>
              </div>
            </Card>
          )}

          {/* 안내 */}
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

          {/* 제출 */}
          <div className="pt-2 safe-bottom">
            <Button
              type="submit"
              loading={loading}
              disabled={!canSubmit}
            >
              {loading ? loadingMsg : 'AI가 할 일 분류하기 ✨'}
            </Button>
            {!canSubmit && content.trim().length > 0 && (
              <p className="text-center text-xs text-slate-400 mt-2">
                주제 옆에 내용을 조금만 더 적어보세요
              </p>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  )
}
