'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClassifyDumpResponse } from '@/types'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type EnergyLevel = 'low' | 'mid' | 'high'
type Priority = 'red' | 'yellow' | 'green'

const PRIORITY_OPTIONS: { value: Priority; label: string; active: string }[] = [
  { value: 'red',    label: '오늘 꼭',     active: 'bg-red-500 text-white border-red-500' },
  { value: 'yellow', label: '하면 좋음',   active: 'bg-blue-500 text-white border-blue-500' },
  { value: 'green',  label: '여유 있으면', active: 'bg-slate-400 text-white border-slate-400' },
]

const PRIORITY_ORDER: Record<Priority, number> = { red: 0, yellow: 1, green: 2 }

const ENERGY_CONFIG: Record<EnergyLevel, {
  emoji: string
  label: string
  maxSelect: number
  recommendedMax: number
  guideText: string
  warningText: string
  color: string
  bg: string
  border: string
}> = {
  low: {
    emoji: '🔴',
    label: '방전됨',
    maxSelect: 2,
    recommendedMax: 1,
    guideText: '오늘은 딱 1~2개만 해요. 가장 쉬운 것 하나면 충분해요.',
    warningText: '방전 상태에서는 1개가 최선이에요. 돌아올 수 있는 게 목표예요.',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  mid: {
    emoji: '🟡',
    label: '보통이에요',
    maxSelect: 3,
    recommendedMax: 2,
    guideText: '2~3개를 권장해요. 무리하지 않는 선에서 골라보세요.',
    warningText: '많이 적는 것보다 돌아올 수 있게 만드는 것이 목표예요.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  high: {
    emoji: '🟢',
    label: '에너지 충분',
    maxSelect: 5,
    recommendedMax: 3,
    guideText: '최대 5개까지 선택할 수 있어요. 어려운 것도 도전해봐요.',
    warningText: '3개 이상은 욕심일 수 있어요. 한 번 더 생각해봐요.',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
}

export default function TaskSelectPage() {
  const router = useRouter()
  const [classifyResult, setClassifyResult] = useState<ClassifyDumpResponse | null>(null)
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [priorities, setPriorities] = useState<Record<string, Priority>>({})

  useEffect(() => {
    const stored = sessionStorage.getItem('classifyResult')
    const storedEnergy = sessionStorage.getItem('energyLevel') as EnergyLevel | null

    if (!stored) {
      router.replace('/brain-dump')
      return
    }
    if (!storedEnergy) {
      router.replace('/energy-select')
      return
    }

    setClassifyResult(JSON.parse(stored) as ClassifyDumpResponse)
    setEnergyLevel(storedEnergy)
  }, [])

  const config = energyLevel ? ENERGY_CONFIG[energyLevel] : null

  function toggle(task: string) {
    if (!config) return
    setSelected((prev) => {
      if (prev.includes(task)) {
        setPriorities((p) => { const n = { ...p }; delete n[task]; return n })
        return prev.filter((t) => t !== task)
      }
      if (prev.length >= config.maxSelect) return prev
      setPriorities((p) => ({ ...p, [task]: 'yellow' }))
      return [...prev, task]
    })
  }

  function setPriority(task: string, p: Priority) {
    setPriorities((prev) => ({ ...prev, [task]: p }))
  }

  function handleNext() {
    if (selected.length === 0) return
    const sorted = [...selected].sort((a, b) =>
      PRIORITY_ORDER[priorities[a] ?? 'yellow'] - PRIORITY_ORDER[priorities[b] ?? 'yellow']
    )
    sessionStorage.setItem('selectedTasks', JSON.stringify(sorted))
    sessionStorage.setItem('taskPriorities', JSON.stringify(priorities))
    sessionStorage.setItem('postitItems', JSON.stringify([]))
    sessionStorage.setItem('currentTaskIndex', '0')
    router.push('/postit-loop')
  }

  if (!classifyResult || !config) {
    return (
      <AppShell>
        <div className="flex min-h-screen justify-center items-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  const { fixedSchedule, taskCandidates } = classifyResult

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 animate-fade-in">

        {/* 헤더 */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-slate-200" />
            <div className="w-2 h-2 rounded-full bg-slate-200" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">오늘 할 일 고르기</h1>
            <button
              onClick={() => router.push('/energy-select')}
              className={[
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all',
                config.bg, config.border, config.color,
              ].join(' ')}
            >
              {config.emoji} {config.label}
              <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14H8v-2a2 2 0 01.586-1.414z" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-500">{config.guideText}</p>
        </div>

        {/* 고정 일정 */}
        {fixedSchedule.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">오늘 고정 일정</p>
            <div className="space-y-1.5">
              {fixedSchedule.map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-sm">📅</span>
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 할 일 후보 */}
        <div className="flex-1 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">오늘 실행 후보</p>
            <span className={['text-xs font-medium', config.color].join(' ')}>
              {selected.length}/{config.maxSelect} 선택됨
            </span>
          </div>

          {taskCandidates.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-400 text-center py-2">
                분류된 할 일이 없어요. 브레인 덤프로 돌아가볼까요?
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {taskCandidates.map((task, i) => {
                const isSelected = selected.includes(task)
                const isDisabled = !isSelected && selected.length >= config.maxSelect
                const activePriority = priorities[task] ?? 'yellow'
                return (
                  <div
                    key={i}
                    className={[
                      'rounded-2xl border-2 overflow-hidden transition-all',
                      isSelected
                        ? 'border-amber-400'
                        : isDisabled
                        ? 'border-slate-100 opacity-40'
                        : 'border-slate-200',
                    ].join(' ')}
                  >
                    <button
                      onClick={() => toggle(task)}
                      disabled={isDisabled}
                      className={[
                        'w-full text-left px-4 py-3.5 transition-all text-sm leading-snug',
                        isSelected
                          ? 'bg-amber-50 text-slate-800 font-medium'
                          : isDisabled
                          ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                          : 'bg-white text-slate-700 hover:bg-amber-50',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={[
                          'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                          isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-300',
                        ].join(' ')}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{task}</span>
                      </div>
                    </button>

                    {isSelected && (
                      <div className="border-t border-amber-200 bg-white px-3 py-3 animate-fade-in">
                        <p className="text-xs font-semibold text-slate-500 mb-2">언제 할 건가요?</p>
                        <div className="flex gap-2">
                          {PRIORITY_OPTIONS.map((opt) => {
                            const isActive = activePriority === opt.value
                            return (
                              <button
                                key={opt.value}
                                onClick={() => setPriority(task, opt.value)}
                                className={[
                                  'flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
                                  isActive
                                    ? opt.active
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300',
                                ].join(' ')}
                              >
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 초과 경고 */}
        {selected.length > config.recommendedMax && (
          <Card variant="highlight" className="mb-4">
            <p className="text-xs text-amber-700 leading-relaxed">
              {config.warningText}
            </p>
          </Card>
        )}

        {/* 방전 상태 특별 메시지 */}
        {energyLevel === 'low' && selected.length === 0 && (
          <Card className="mb-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              오늘은 정말 힘드네요. 목록 중 <strong className="text-slate-700">가장 작고 쉬운 것 하나</strong>만 골라도 충분해요.
            </p>
          </Card>
        )}

        {/* 버튼 */}
        <div className="space-y-3 safe-bottom">
          <Button onClick={handleNext} disabled={selected.length === 0}>
            {Object.values(priorities).includes('red')
              ? `🔴부터 변환할게요 (${selected.length}개)`
              : `선택 완료 → 포스트잇 만들기 (${selected.length}개)`}
          </Button>
          <Button variant="secondary" onClick={() => router.push('/brain-dump')}>
            다시 작성하기
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
