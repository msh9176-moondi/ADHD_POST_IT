'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DailyPostitItem } from '@/types'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'

const TIMER_OPTIONS = [
  { label: '10분', seconds: 600 },
  { label: '5분', seconds: 300 },
  { label: '3분', seconds: 180 },
]

export default function TimerPage() {
  const router = useRouter()
  const [items, setItems] = useState<DailyPostitItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(600)
  const [timerTotal, setTimerTotal] = useState(600)
  const [timerRunning, setTimerRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const storedItems = sessionStorage.getItem('postitItems')
    if (storedItems) {
      const parsed: DailyPostitItem[] = JSON.parse(storedItems)
      setItems(parsed)
    }
    const storedIndex = sessionStorage.getItem('timerItemIndex')
    if (storedIndex) setCurrentIndex(parseInt(storedIndex, 10))
  }, [])

  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => {
          if (s <= 1) {
            setTimerRunning(false)
            clearInterval(intervalRef.current!)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerRunning])

  function startTimer(seconds: number) {
    setTimerSeconds(seconds)
    setTimerTotal(seconds)
    setTimerRunning(true)
    setStarted(true)
  }

  function toggleTimer() {
    setTimerRunning((r) => !r)
  }

  function resetTimer() {
    setTimerRunning(false)
    setTimerSeconds(timerTotal)
    setStarted(false)
  }

  function goNextItem() {
    const nextIndex = currentIndex + 1
    sessionStorage.setItem('timerItemIndex', String(nextIndex))
    setCurrentIndex(nextIndex)
    setTimerRunning(false)
    setTimerSeconds(600)
    setTimerTotal(600)
    setStarted(false)
  }

  const currentItem = items[currentIndex]
  const hasNext = currentIndex + 1 < items.length
  const minutes = Math.floor(timerSeconds / 60)
  const seconds = timerSeconds % 60
  const timerProgress = timerTotal > 0 ? ((timerTotal - timerSeconds) / timerTotal) * 100 : 0

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 space-y-5 animate-fade-in">

        {/* 진행 상황 */}
        {items.length > 1 && (
          <div className="flex items-center gap-1.5">
            {items.map((_, i) => (
              <div
                key={i}
                className={[
                  'h-1.5 flex-1 rounded-full transition-all',
                  i < currentIndex ? 'bg-amber-400' : i === currentIndex ? 'bg-amber-300' : 'bg-slate-200',
                ].join(' ')}
              />
            ))}
          </div>
        )}

        {/* 현재 포스트잇 문장 */}
        {currentItem && (
          <div className="bg-amber-300 rounded-2xl px-4 py-4 text-center shadow-sm">
            {items.length > 1 && (
              <p className="text-xs text-amber-700 font-medium mb-1">
                {currentIndex + 1} / {items.length}번째 포스트잇
              </p>
            )}
            <p className="text-slate-800 text-base font-bold leading-snug">
              {currentItem.finalPostitSentence}
            </p>
          </div>
        )}

        {!started ? (
          /* 시간 선택 */
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-center text-xl font-bold text-slate-800">
                이 행동, 지금 시작해볼까요?
              </p>
              <p className="text-center text-sm text-slate-400">
                다 끝내지 않아도 돼요. 딱 이 시간만요.
              </p>
            </div>
            <div className="flex gap-2">
              {TIMER_OPTIONS.map(({ label, seconds: s }) => (
                <button
                  key={label}
                  onClick={() => startTimer(s)}
                  className="flex-1 py-5 bg-amber-400 text-slate-800 rounded-full font-bold text-xl hover:bg-amber-500 active:bg-amber-600 transition-all shadow-md"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* 타이머 실행 중 */
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#fef3c7" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - timerProgress / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-800 tabular-nums">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    {timerSeconds === 0 ? '완료!' : timerRunning ? '집중 중' : '일시정지'}
                  </span>
                </div>
              </div>
            </div>

            {timerSeconds === 0 ? (
              /* 완료 상태 */
              <div className="text-center space-y-2">
                <p className="text-4xl">🎉</p>
                <p className="text-lg font-bold text-slate-700">완료! 정말 잘했어요!</p>
                {hasNext && (
                  <p className="text-sm text-slate-400">
                    다음 포스트잇도 해볼까요?
                  </p>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={toggleTimer}
                  className="flex-1 py-3.5 bg-amber-400 text-slate-800 rounded-full font-semibold hover:bg-amber-500 transition-all"
                >
                  {timerRunning ? '⏸ 일시정지' : '▶ 재시작'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-5 py-3.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-all"
                >
                  ↺
                </button>
              </div>
            )}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="pt-4 pb-6 space-y-3 safe-bottom">
          {timerSeconds === 0 && hasNext ? (
            <>
              <Button onClick={goNextItem}>
                다음 포스트잇 시작하기 →
              </Button>
              <Button variant="secondary" onClick={() => router.push('/profile')}>
                오늘은 여기까지
              </Button>
            </>
          ) : timerSeconds === 0 ? (
            <Button onClick={() => router.push('/profile')}>
              오늘 완료 🎉 성장 기록 보기
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => router.push('/profile')}
            >
              오늘은 여기까지
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
