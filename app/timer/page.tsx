'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'

const TIMER_OPTIONS = [
  { label: '10분', seconds: 600 },
  { label: '5분', seconds: 300 },
  { label: '3분', seconds: 180 },
]

export default function TimerPage() {
  const router = useRouter()
  const [postitSentence, setPostitSentence] = useState('')
  const [timerSeconds, setTimerSeconds] = useState(600)
  const [timerTotal, setTimerTotal] = useState(600)
  const [timerRunning, setTimerRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const storedItems = sessionStorage.getItem('postitItems')
    if (storedItems) {
      const parsed = JSON.parse(storedItems)
      if (parsed.length > 0) setPostitSentence(parsed[0].finalPostitSentence)
    } else {
      const storedAi = sessionStorage.getItem('aiResult')
      if (storedAi) setPostitSentence(JSON.parse(storedAi).finalPostitSentence ?? '')
    }
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
  }

  const minutes = Math.floor(timerSeconds / 60)
  const seconds = timerSeconds % 60
  const timerProgress = timerTotal > 0 ? ((timerTotal - timerSeconds) / timerTotal) * 100 : 0

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 space-y-5 animate-fade-in">

        {/* Post-it sentence */}
        {postitSentence && (
          <div className="bg-amber-300 rounded-2xl px-4 py-4 text-center shadow-sm">
            <p className="text-slate-800 text-base font-bold leading-snug">{postitSentence}</p>
          </div>
        )}

        {!started ? (
          /* Duration selection */
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
          /* Timer running */
          <div className="space-y-4">
            {/* Circular timer */}
            <div className="flex justify-center">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="44"
                    fill="none"
                    stroke="#fef3c7"
                    strokeWidth="8"
                  />
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
              <div className="text-center space-y-3">
                <p className="text-3xl">🎉</p>
                <p className="text-lg font-bold text-slate-700">완료! 정말 잘했어요!</p>
                <Button variant="secondary" onClick={resetTimer}>
                  다시 하기
                </Button>
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

        {/* Bottom CTA */}
        <div className="pt-4 pb-6 safe-bottom">
          <Button
            variant={timerSeconds === 0 ? 'primary' : 'secondary'}
            onClick={() => router.push('/profile')}
          >
            내 성장 기록 보기
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
