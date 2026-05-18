'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { grantXP } from '@/lib/xp/reward'
import AppShell from '@/components/layout/AppShell'

const LOCATIONS = [
  { icon: '💻', label: '노트북 옆' },
  { icon: '🖥️', label: '모니터 앞' },
  { icon: '🚪', label: '방문' },
  { icon: '📱', label: '스마트폰 뒤' },
  { icon: '👜', label: '지갑 안' },
  { icon: '📌', label: '기타' },
]

export default function PostitLocationPage() {
  const router = useRouter()
  const [sentence, setSentence] = useState('')

  useEffect(() => {
    const storedItems = sessionStorage.getItem('postitItems')
    if (storedItems) {
      const parsed = JSON.parse(storedItems)
      if (parsed.length > 0) setSentence(parsed[0].finalPostitSentence ?? '')
    } else {
      const storedAi = sessionStorage.getItem('aiResult')
      if (storedAi) setSentence(JSON.parse(storedAi).finalPostitSentence ?? '')
    }
  }, [])

  async function handleLocation(loc: string) {
    sessionStorage.setItem('postitLocation', loc)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await grantXP(supabase, user.id, 'postit_written')
    router.push('/reward')
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 animate-fade-in">

        {/* 헤더 */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-slate-800">어디에 붙일까요?</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            눈에 잘 보이는 곳일수록 더 잘 기억돼요.
          </p>
        </div>

        {/* 미니 포스트잇 리마인더 */}
        {sentence && (
          <div className="bg-amber-300 rounded-2xl px-4 py-3 mb-6 shadow-sm text-center">
            <p className="text-slate-800 text-sm font-bold leading-snug">{sentence}</p>
          </div>
        )}

        {/* 위치 그리드 */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3">
            {LOCATIONS.map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => handleLocation(label)}
                className="flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all active:scale-[0.97]"
              >
                <span className="text-3xl">{icon}</span>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 건너뛰기 */}
        <div className="mt-6 safe-bottom">
          <button
            onClick={() => router.push('/reward')}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-3"
          >
            건너뛰기
          </button>
        </div>
      </div>
    </AppShell>
  )
}
