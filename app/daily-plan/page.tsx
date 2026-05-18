'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DailyPostitItem } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { grantXP } from '@/lib/xp/reward'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import HandwriteAnim from '@/components/ui/HandwriteAnim'

const ITEMS_PER_PAGE = 10

function formatTime(hhmm: string) {
  if (!hhmm) return '미정'
  const [h, m] = hhmm.split(':').map(Number)
  const period = h < 12 ? '오전' : '오후'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${period} ${hour}:${String(m).padStart(2, '0')}`
}

function PostitSheet({
  items,
  pageNum,
  totalPages,
}: {
  items: DailyPostitItem[]
  pageNum: number
  totalPages: number
}) {
  const today = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  const ITEM_AREA_PCT = 78
  const rowPct = ITEM_AREA_PCT / ITEMS_PER_PAGE

  return (
    <div
      className="relative w-full overflow-hidden rounded-sm"
      style={{
        aspectRatio: '52 / 75',
        background: '#fef08a',
        boxShadow: '4px 6px 18px rgba(0,0,0,0.22), 1px 2px 4px rgba(0,0,0,0.10)',
      }}
    >
      {/* 접착 띠 */}
      <div
        className="absolute top-0 left-0 right-0 z-10"
        style={{
          height: '11%',
          background: 'rgba(250,204,21,0.9)',
          borderBottom: '1px solid rgba(161,98,7,0.2)',
        }}
      />

      {/* 헤더 */}
      <div
        className="absolute left-0 right-0 z-10 flex items-center justify-between"
        style={{
          top: '11%',
          height: '11%',
          paddingLeft: '3%',
          paddingRight: '3%',
          borderBottom: '1.5px solid rgba(161,98,7,0.35)',
          background: 'rgba(254,240,138,0.6)',
        }}
      >
        <span
          style={{
            fontSize: 'clamp(13px, 3.6vw, 16px)',
            fontWeight: 800,
            color: '#78350f',
            letterSpacing: '-0.01em',
          }}
        >
          오늘의 계획{totalPages > 1 ? ` (${pageNum}/${totalPages})` : ''}
        </span>
        <span
          style={{
            fontSize: 'clamp(11px, 2.8vw, 13px)',
            color: '#92400e',
            opacity: 0.7,
          }}
        >
          {today}
        </span>
      </div>

      {/* 세로 구분선 */}
      <div
        className="absolute z-10"
        style={{
          top: '22%',
          bottom: 0,
          left: '26%',
          width: '1px',
          background: 'rgba(161,98,7,0.25)',
        }}
      />

      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => {
        const item = items[i]
        const topPct = 22 + i * rowPct

        return (
          <div key={i}>
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${topPct + rowPct}%`,
                height: '1px',
                background: 'rgba(161,98,7,0.13)',
              }}
            />

            {item ? (
              <>
                <div
                  className="absolute flex items-center"
                  style={{
                    top: `${topPct}%`,
                    height: `${rowPct}%`,
                    left: '2%',
                    width: '23%',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'clamp(11px, 3vw, 13px)',
                      color: item.startTime ? '#b45309' : '#d97706',
                      fontWeight: item.startTime ? 600 : 400,
                      opacity: item.startTime ? 1 : 0.6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatTime(item.startTime ?? '')}
                  </span>
                </div>

                <div
                  className="absolute flex items-center"
                  style={{
                    top: `${topPct}%`,
                    height: `${rowPct}%`,
                    left: '28%',
                    right: '2%',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'clamp(12px, 3.4vw, 15px)',
                      color: item.priority === 'red' ? '#dc2626' : item.priority === 'yellow' ? '#2563eb' : '#1c1917',
                      fontWeight: item.priority === 'red' ? 700 : 500,
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.finalPostitSentence}
                  </span>
                </div>
              </>
            ) : (
              <div
                className="absolute"
                style={{
                  top: `${topPct}%`,
                  height: `${rowPct}%`,
                  left: '2%',
                  right: '2%',
                }}
              />
            )}
          </div>
        )
      })}

      {/* 우측 하단 접힘 */}
      <div
        className="absolute bottom-0 right-0 z-20"
        style={{
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '0 0 18px 18px',
          borderColor: 'transparent transparent rgba(161,98,7,0.2) transparent',
        }}
      />
    </div>
  )
}

export default function DailyPlanPage() {
  const router = useRouter()
  const [items, setItems] = useState<DailyPostitItem[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('postitItems')
    if (!stored) {
      router.replace('/brain-dump')
      return
    }
    const parsed: DailyPostitItem[] = JSON.parse(stored)
    if (parsed.length === 0) {
      router.replace('/task-select')
      return
    }
    const sorted = [...parsed].sort((a, b) => {
      const ta = a.startTime || '99:99'
      const tb = b.startTime || '99:99'
      return ta.localeCompare(tb)
    })
    setItems(sorted)

    const today = new Date().toISOString().slice(0, 10)
    if (sessionStorage.getItem(`planSaved_${today}`) === 'true') {
      setSaved(true)
      return
    }

    async function checkAlreadySaved() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('daily_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()
      if (data) {
        sessionStorage.setItem(`planSaved_${today}`, 'true')
        setSaved(true)
      }
    }
    checkAlreadySaved()
  }, [])

  async function handleSave() {
    if (saved) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const today = new Date().toISOString().slice(0, 10)
        const brainDumpId = sessionStorage.getItem('brainDumpId') ?? null

        const { data: planData } = await supabase
          .from('daily_plans')
          .insert({ user_id: user.id, date: today, brain_dump_id: brainDumpId || null })
          .select('id')
          .single()

        const planId = planData?.id

        if (planId) {
          const rows = items.map((item, i) => ({
            user_id: user.id,
            brain_dump_id: brainDumpId || null,
            daily_plan_id: planId,
            original_task: item.originalTask,
            final_sentence: item.finalPostitSentence,
            backup_tiny_action: item.backupTinyAction,
            estimated_start_time: item.estimatedStartTime,
            start_time: item.startTime ?? null,
            display_order: i + 1,
          }))
          await supabase.from('plan_sentences').insert(rows)
        }

        for (let i = 0; i < items.length; i++) {
          await grantXP(supabase, user.id, 'plan_sentence')
        }
      }

      const todayKey = new Date().toISOString().slice(0, 10)
      sessionStorage.setItem(`planSaved_${todayKey}`, 'true')
      setSaved(true)
      router.push('/postit-location')
    } finally {
      setSaving(false)
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

  const pages: DailyPostitItem[][] = []
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE))
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 animate-fade-in">

        {/* 헤더 */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
          </div>

          <div className="bg-amber-400 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-4">
              <HandwriteAnim />
              <div>
                <p className="text-slate-900 font-extrabold text-base leading-snug">
                  아래 계획을 포스트잇에<br />손으로 써주세요
                </p>
                <p className="text-amber-900 text-xs mt-0.5 opacity-80">
                  눈에 잘 띄는 곳에 붙여두세요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 포스트잇 장(들) */}
        <div className="flex-1 space-y-8 mb-6">
          {pages.map((pageItems, pi) => (
            <div key={pi} className="animate-fade-in" style={{ animationDelay: `${pi * 120}ms` }}>
              <PostitSheet
                items={pageItems}
                pageNum={pi + 1}
                totalPages={pages.length}
              />
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center mb-5 leading-relaxed">
          손으로 쓰는 순간 뇌가 &apos;오늘 해야 할 일&apos;로 인식해요.<br />
          쓰고 나서 눈에 잘 띄는 곳에 붙여두세요.
        </p>

        <div className="space-y-3 safe-bottom">
          <Button onClick={saved ? () => router.push('/postit-location') : handleSave} loading={saving}>
            {saved ? '어디에 붙일까요? →' : '계획 작성하고 XP 받기'}
          </Button>
          {!saved && (
            <Button
              variant="secondary"
              onClick={() => router.push('/task-select')}
              disabled={saving}
            >
              포스트잇 항목 수정하기
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
