'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DailyPostitItem } from '@/types'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'

function nowHHMM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatDisplay(hhmm: string) {
  if (!hhmm) return '시간 선택'
  const [h, m] = hhmm.split(':').map(Number)
  const period = h < 12 ? '오전' : '오후'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${period} ${hour}:${String(m).padStart(2, '0')}`
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// 해당 항목 직전에 배치된 시간과의 간격(분) 반환. 30분 미만이면 경고.
function gapWarning(id: string, times: Record<string, string>): string | null {
  const entries = Object.entries(times)
    .filter(([, t]) => t !== '')
    .map(([k, t]) => ({ id: k, min: toMinutes(t) }))
    .sort((a, b) => a.min - b.min)

  const myMin = times[id] ? toMinutes(times[id]) : null
  if (myMin === null) return null

  const myIdx = entries.findIndex((e) => e.id === id)
  if (myIdx <= 0) return null

  const prev = entries[myIdx - 1]
  const gap = myMin - prev.min
  if (gap < 30) {
    return `앞 일정과 ${gap}분 간격이에요. 이동·준비 시간을 고려해 여유를 두세요.`
  }
  return null
}

export default function TimeArrangePage() {
  const router = useRouter()
  const [items, setItems] = useState<DailyPostitItem[]>([])
  const [times, setTimes] = useState<Record<string, string>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const stored = sessionStorage.getItem('postitItems')
    if (!stored) { router.replace('/brain-dump'); return }
    const parsed: DailyPostitItem[] = JSON.parse(stored)
    if (parsed.length === 0) { router.replace('/task-select'); return }
    setItems(parsed)
    const initial: Record<string, string> = {}
    parsed.forEach((item) => { initial[item.id] = '' })
    setTimes(initial)
  }, [])

  function setTime(id: string, hhmm: string) {
    setTimes((prev) => ({ ...prev, [id]: hhmm }))
  }

  function openPicker(id: string) {
    inputRefs.current[id]?.showPicker?.()
    inputRefs.current[id]?.click()
  }

  function handleComplete() {
    const finalItems = items.map((item) => ({
      ...item,
      startTime: times[item.id] || '',
    }))
    sessionStorage.setItem('postitItems', JSON.stringify(finalItems))
    router.push('/daily-plan')
  }

  if (items.length === 0) {
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

        {/* 헤더 */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-slate-200" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">언제 할까요?</h1>
          <p className="text-sm text-slate-500">
            시작 시간을 정하면 더 실행하기 쉬워요. 건너뛰어도 괜찮아요.
          </p>
        </div>

        {/* ADHD 시간 원칙 안내 */}
        <div className="mb-5 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2.5">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">시간 배치 전 알아두세요</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 font-bold text-sm flex-shrink-0">×1.5</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                생각한 시간의 <strong>1.5~2배</strong>가 실제로 걸려요. 10분짜리라도 준비·이동까지 포함하면 더 길어질 수 있어요.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500 font-bold text-sm flex-shrink-0">□□</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                일정 사이에 <strong>완충 시간</strong>을 두세요. 빡빡하게 채우면 하나가 밀릴 때 전부 무너져요.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-500 font-bold text-sm flex-shrink-0">☕</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>쉬는 시간도 계획</strong>에 넣어두세요. 비어있는 시간이 있어야 계획이 지속돼요.
              </p>
            </div>
          </div>
        </div>

        {/* 항목 목록 */}
        <div className="flex-1 space-y-5 mb-6">
          {items.map((item) => {
            const t = times[item.id] ?? ''
            const hasTime = t !== ''
            const warning = gapWarning(item.id, times)

            return (
              <div key={item.id} className="space-y-2">
                {/* 미니 포스트잇 */}
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-200 rounded-xl translate-x-1 translate-y-1" />
                  <div className="relative bg-amber-300 rounded-xl px-4 py-3">
                    <p className="text-slate-800 text-sm font-semibold leading-snug">
                      {item.finalPostitSentence}
                    </p>
                    <p className="text-amber-700 text-xs mt-1 opacity-70">
                      AI 예상: {item.estimatedStartTime} → 실제로는 더 걸릴 수 있어요
                    </p>
                  </div>
                </div>

                {/* 시간 선택 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPicker(item.id)}
                    className={[
                      'flex-1 flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all',
                      hasTime ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className={['w-4 h-4', hasTime ? 'text-amber-500' : 'text-slate-400'].join(' ')}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path strokeLinecap="round" d="M12 6v6l4 2" />
                      </svg>
                      <span className={[
                        'font-medium text-sm',
                        hasTime ? 'text-amber-700' : 'text-slate-400',
                      ].join(' ')}>
                        {formatDisplay(t)}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <input
                    ref={(el) => { inputRefs.current[item.id] = el }}
                    type="time"
                    value={t}
                    onChange={(e) => setTime(item.id, e.target.value)}
                    className="sr-only"
                    tabIndex={-1}
                  />

                  {/* 지금 버튼 */}
                  <button
                    onClick={() => setTime(item.id, nowHHMM())}
                    className="px-3 py-3 rounded-2xl border-2 border-slate-200 bg-white text-xs text-slate-500 whitespace-nowrap hover:border-amber-300 transition-all"
                  >
                    지금
                  </button>

                  {/* 삭제 버튼 */}
                  {hasTime && (
                    <button
                      onClick={() => setTime(item.id, '')}
                      className="px-3 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:text-red-400 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* 간격 경고 */}
                {warning && (
                  <div className="flex items-center gap-2 px-1">
                    <svg className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-xs text-orange-500">{warning}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 버튼 */}
        <div className="space-y-3 safe-bottom">
          <Button onClick={handleComplete}>
            시간 배치 완료 →
          </Button>
          <Button variant="secondary" onClick={() => router.push('/daily-plan')}>
            건너뛰고 계획표 보기
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
