'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

  useEffect(() => {
    const stored = sessionStorage.getItem('postitItems')
    if (!stored || JSON.parse(stored).length === 0) {
      router.replace('/brain-dump')
    }
  }, [])

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 animate-fade-in">
        <div className="space-y-1 mb-8">
          <h2 className="text-2xl font-bold text-slate-800">어디에 붙일까요?</h2>
          <p className="text-sm text-slate-500">눈에 잘 보이는 곳일수록 더 잘 기억돼요.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {LOCATIONS.map(({ icon, label }) => (
            <button
              key={label}
              onClick={() => {
                sessionStorage.setItem('postitLocation', label)
                router.push('/reward')
              }}
              className="flex flex-col items-center gap-2 py-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all active:scale-[0.97]"
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/reward')}
          className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-3 mt-4"
        >
          건너뛰기
        </button>
      </div>
    </AppShell>
  )
}
