'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DailyPostitItem } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { grantXP } from '@/lib/xp/reward'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'

interface WrittenLine {
  time: string
  sentence: string
}

function toDisplayTime(hhmm?: string) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const period = h < 12 ? '오전' : '오후'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${period} ${hour}:${String(m).padStart(2, '0')}`
}

export default function WritePostitPage() {
  const router = useRouter()
  const [items, setItems] = useState<DailyPostitItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [writtenLines, setWrittenLines] = useState<WrittenLine[]>([])
  const [currentTime, setCurrentTime] = useState('')
  const [xpGranted, setXpGranted] = useState(false)
  const timeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('postitItems')
    if (!stored) { router.replace('/brain-dump'); return }
    const parsed: DailyPostitItem[] = JSON.parse(stored)
    if (parsed.length === 0) { router.replace('/brain-dump'); return }
    setItems(parsed)
    setCurrentTime(toDisplayTime(parsed[0]?.startTime))
  }, [])

  useEffect(() => {
    if (items.length > 0 && currentIndex < items.length) {
      setCurrentTime(toDisplayTime(items[currentIndex]?.startTime))
      setTimeout(() => timeInputRef.current?.focus(), 100)
    }
  }, [currentIndex, items])

  async function advance(time: string) {
    if (!xpGranted) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await grantXP(supabase, user.id, 'postit_written')
        setXpGranted(true)
      }
    }

    const newLines = [...writtenLines, { time, sentence: items[currentIndex].finalPostitSentence }]
    setWrittenLines(newLines)

    if (currentIndex < items.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      router.push('/postit-location')
    }
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

  const item = items[currentIndex]
  const total = items.length
  const TOTAL_LINES = Math.max(total, 4)
  const emptyCount = TOTAL_LINES - writtenLines.length - 1

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 animate-fade-in">

        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">포스트잇에 써주세요</h1>
          <p className="text-sm text-slate-500 mt-1">시간도 꼭 적어주세요. 손으로 쓰는 순간 뇌에 새겨져요.</p>
        </div>

        {/* 포스트잇 */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative w-full max-w-sm">
            {/* 그림자 */}
            <div className="absolute inset-0 bg-amber-200 rounded-sm translate-x-2 translate-y-2" />

            {/* 포스트잇 본체 */}
            <div className="relative bg-amber-300 rounded-sm shadow-postit overflow-hidden">

              {/* 접착 띠 + 압정 */}
              <div className="h-9 bg-amber-400/80 flex items-center justify-center">
                <div className="w-5 h-5 bg-amber-600 rounded-full shadow-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-amber-200 rounded-full" />
                </div>
              </div>

              {/* 컬럼 헤더 */}
              <div className="flex items-center border-b border-amber-500/30 bg-amber-400/20 px-3 py-1.5">
                <span className="w-20 text-[10px] font-bold text-amber-900 text-center flex-shrink-0">시간</span>
                <div className="w-px h-3 bg-amber-500/40 mx-1 flex-shrink-0" />
                <span className="text-[10px] font-bold text-amber-900">할 일</span>
              </div>

              {/* 완료된 줄들 */}
              {writtenLines.map((line, i) => (
                <div key={i} className="flex items-start border-b border-amber-400/25 px-3 py-2.5">
                  <span className="w-20 text-xs text-amber-800 font-medium text-center flex-shrink-0 leading-snug">
                    {line.time || '—'}
                  </span>
                  <div className="w-px self-stretch bg-amber-400/30 mx-1 flex-shrink-0" />
                  <span className="text-sm text-slate-700 leading-snug">{line.sentence}</span>
                </div>
              ))}

              {/* 현재 줄 (입력 중) */}
              <div className="flex items-start border-b-2 border-amber-600/40 bg-white/30 px-3 py-2.5 animate-fade-in">
                <div className="w-20 flex-shrink-0">
                  <input
                    ref={timeInputRef}
                    type="text"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(e.target.value)}
                    placeholder="시간?"
                    className="w-full text-xs text-amber-900 bg-transparent border-none outline-none text-center placeholder-amber-600/60 font-semibold"
                    maxLength={12}
                  />
                </div>
                <div className="w-px self-stretch bg-amber-500/40 mx-1 flex-shrink-0" />
                <span className="text-sm text-slate-800 leading-snug font-semibold">
                  {item.finalPostitSentence}
                </span>
              </div>

              {/* 빈 줄들 */}
              {Array.from({ length: emptyCount }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center border-b border-amber-400/20 px-3 py-3 opacity-30">
                  <div className="w-20 h-2.5 bg-amber-500/20 rounded-sm flex-shrink-0" />
                  <div className="w-px h-4 bg-amber-400/20 mx-1 flex-shrink-0" />
                  <div className="flex-1 h-2.5 bg-amber-500/20 rounded-sm" />
                </div>
              ))}

              {/* 하단 여백 */}
              <div className="h-4" />
            </div>
          </div>

          {/* 진행 표시 */}
          {total > 1 && (
            <div className="flex items-center gap-1.5 mt-5">
              {items.map((_, i) => (
                <div
                  key={i}
                  className={[
                    'h-1.5 w-8 rounded-full transition-all',
                    i < currentIndex ? 'bg-amber-400' : i === currentIndex ? 'bg-amber-500' : 'bg-slate-200',
                  ].join(' ')}
                />
              ))}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="space-y-3 mt-6 safe-bottom">
          <Button onClick={() => advance(currentTime)}>
            ✏️ {total > 1 ? `${currentIndex + 1}번째 다 썼어요! (${currentIndex + 1}/${total})` : '다 썼어요!'}
          </Button>
          <button
            onClick={() => advance('')}
            className="w-full py-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            지금은 못 쓰겠어요, 그냥 시작할게요 →
          </button>
        </div>
      </div>
    </AppShell>
  )
}
