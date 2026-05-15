'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { grantXP } from '@/lib/xp/reward'
import { ConvertPlanResponse } from '@/types'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'

type StepId = 'postit' | 'tasks' | 'backup' | 'ifthen' | 'reward' | 'later' | 'emotions' | 'done'

const TASK_TYPE_LABEL: Record<string, string> = {
  work: '💼 업무', study: '📚 공부', health: '🏃 건강', home: '🏠 집안일',
  admin: '📋 행정', relationship: '💬 관계', recovery: '🌿 회복', unknown: '📌 기타',
}

const DIFFICULTY: Record<string, { text: string; color: string }> = {
  very_easy: { text: '매우 쉬움', color: 'bg-green-100 text-green-700' },
  easy: { text: '쉬움', color: 'bg-blue-100 text-blue-700' },
  medium: { text: '보통', color: 'bg-amber-100 text-amber-700' },
}

function MiniPostit({ sentence }: { sentence: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
      <p className="text-amber-800 text-sm font-semibold leading-snug">{sentence}</p>
    </div>
  )
}

export default function AiResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<ConvertPlanResponse | null>(null)
  const [xpGranted, setXpGranted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    async function init() {
      const stored = sessionStorage.getItem('aiResult')
      if (!stored) {
        router.replace('/brain-dump')
        return
      }
      const parsed = JSON.parse(stored) as ConvertPlanResponse
      setResult(parsed)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const xpResult = await grantXP(supabase, user.id, 'plan_sentence')
        setXpGranted(xpResult.granted)

        const brainDumpId = sessionStorage.getItem('brainDumpId')
        const brainDumpContent = sessionStorage.getItem('brainDumpContent')
        if (brainDumpId) {
          await supabase.from('plan_sentences').insert({
            user_id: user.id,
            brain_dump_id: brainDumpId,
            original_task: parsed.recommendedTask,
            final_sentence: parsed.finalPostitSentence,
            written_confirmed: false,
          })
        } else if (brainDumpContent) {
          const { data: bd } = await supabase
            .from('brain_dumps')
            .insert({ user_id: user.id, content: brainDumpContent })
            .select('id')
            .single()
          if (bd) {
            await supabase.from('plan_sentences').insert({
              user_id: user.id,
              brain_dump_id: bd.id,
              original_task: parsed.recommendedTask,
              final_sentence: parsed.finalPostitSentence,
              written_confirmed: false,
            })
          }
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const steps = useMemo<StepId[]>(() => {
    if (!result) return ['postit']
    const s: StepId[] = ['postit']
    if (result.immediateTasks.length > 0) s.push('tasks')
    if (result.backupTinyAction) s.push('backup')
    if (result.ifThenPlan) s.push('ifthen')
    if (result.rewardSuggestion) s.push('reward')
    if (result.laterTasks.length > 0) s.push('later')
    if (result.emotionOrAvoidanceSignals.length > 0) s.push('emotions')
    s.push('done')
    return s
  }, [result])

  if (loading || !result) {
    return (
      <AppShell>
        <div className="flex min-h-screen justify-center items-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  const currentStepId = steps[stepIndex]
  const isLast = currentStepId === 'done'

  function goNext() {
    if (!isLast) setStepIndex(i => i + 1)
  }

  function goPrev() {
    if (stepIndex > 0) setStepIndex(i => i - 1)
  }

  function renderStep() {
    const r = result!
    switch (currentStepId) {
      case 'postit':
        return (
          <div className="space-y-5">
            {xpGranted && (
              <div className="bg-amber-400 rounded-2xl p-3 flex items-center gap-2.5">
                <span className="text-xl">🎁</span>
                <p className="font-bold text-slate-800 text-sm">+20 XP — 계획 문장 완성!</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-3">AI가 이 문장을 골랐어요</p>
              <div className="postit-card rotate-1 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-amber-200 rounded-b-full opacity-60" />
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {r.taskType && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                      {TASK_TYPE_LABEL[r.taskType] ?? r.taskType}
                    </span>
                  )}
                  {r.difficultyLevel && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY[r.difficultyLevel]?.color ?? ''}`}>
                      {DIFFICULTY[r.difficultyLevel]?.text}
                    </span>
                  )}
                  {r.estimatedStartTime && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium ml-auto">
                      ⏱ {r.estimatedStartTime}
                    </span>
                  )}
                </div>
                <p className="text-slate-800 text-xl font-bold leading-snug">{r.finalPostitSentence}</p>
                <p className="text-amber-700 text-xs mt-3 opacity-80">{r.reason}</p>
              </div>
            </div>
          </div>
        )

      case 'tasks':
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">오늘 바로 할 수 있는 것들</p>
            <MiniPostit sentence={r.finalPostitSentence} />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <p className="text-slate-800 font-semibold">{r.recommendedTask}</p>
              </div>
              <ul className="space-y-2 pl-1">
                {r.immediateTasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 bg-white rounded-xl p-3 border border-slate-100">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">▸</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )

      case 'backup':
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">그것도 어렵다면?</p>
            <MiniPostit sentence={r.finalPostitSentence} />
            <div className="flex items-start gap-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <span className="text-3xl flex-shrink-0">🪜</span>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">대신 이것만</p>
                <p className="text-slate-800 font-bold text-lg leading-snug">{r.backupTinyAction}</p>
              </div>
            </div>
          </div>
        )

      case 'ifthen':
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">방해받을 때를 대비해서</p>
            <MiniPostit sentence={r.finalPostitSentence} />
            <div className="flex items-start gap-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <span className="text-3xl flex-shrink-0">🔄</span>
              <p className="text-slate-700 leading-relaxed">{r.ifThenPlan}</p>
            </div>
          </div>
        )

      case 'reward':
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">끝나면 이걸 받기로 해요</p>
            <MiniPostit sentence={r.finalPostitSentence} />
            <div className="flex items-start gap-3 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <span className="text-3xl flex-shrink-0">🎁</span>
              <p className="text-slate-700 leading-relaxed">{r.rewardSuggestion}</p>
            </div>
          </div>
        )

      case 'later':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">나중에 볼 것들</p>
              <p className="text-sm text-slate-500 mt-1">지금은 아니에요. 일단 보관만 해요.</p>
            </div>
            <ul className="space-y-2">
              {r.laterTasks.map((task, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400 bg-white rounded-xl p-3 border border-slate-100">
                  <span className="mt-0.5 flex-shrink-0">○</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )

      case 'emotions':
        return (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">감정 / 회피 신호</p>
              <p className="text-sm text-slate-500 mt-1">이런 감정이 드는 건 자연스러운 일이에요.</p>
            </div>
            <ul className="space-y-2">
              {r.emotionOrAvoidanceSignals.map((signal, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500 bg-white rounded-xl p-3 border border-slate-100">
                  <span className="flex-shrink-0">💭</span>
                  <span className="italic">{signal}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400">인식했다는 것만으로도 충분해요.</p>
          </div>
        )

      case 'done':
        return (
          <div className="space-y-5 text-center">
            <div className="text-5xl">✨</div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800">준비됐어요</h2>
              <p className="text-sm text-slate-500">이제 포스트잇에 직접 적어볼까요?</p>
            </div>
            <div className="postit-card rotate-1 text-left">
              <p className="text-slate-800 text-lg font-bold leading-snug">{r.finalPostitSentence}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === stepIndex
                  ? 'w-4 h-2 bg-amber-400'
                  : i < stepIndex
                  ? 'w-2 h-2 bg-amber-200'
                  : 'w-2 h-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div key={stepIndex} className="flex-1 animate-fade-in">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="pt-8 pb-6 space-y-3 safe-bottom">
          {isLast ? (
            <>
              <Button onClick={() => router.push('/postit-confirm')}>
                포스트잇에 적으러 가기 →
              </Button>
              <Button variant="secondary" onClick={() => router.push('/brain-dump')}>
                다시 브레인 덤프하기
              </Button>
            </>
          ) : (
            <Button onClick={goNext}>
              {stepIndex === 0 ? '확인했어요 →' : '다음 →'}
            </Button>
          )}
          {stepIndex > 0 && !isLast && (
            <button
              onClick={goPrev}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
            >
              ← 이전
            </button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
