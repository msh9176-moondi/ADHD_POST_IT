'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClassifyDumpResponse } from '@/types'
import { EnergyLevel, ENERGY_CONFIG } from '@/lib/config/energyLevels'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function EnergySelectPage() {
  const router = useRouter()
  const [classifyResult, setClassifyResult] = useState<ClassifyDumpResponse | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('classifyResult')
    if (!stored) {
      router.replace('/brain-dump')
      return
    }
    setClassifyResult(JSON.parse(stored) as ClassifyDumpResponse)
  }, [])

  function selectEnergy(level: EnergyLevel) {
    sessionStorage.setItem('energyLevel', level)
    router.push('/task-select')
  }

  if (!classifyResult) {
    return (
      <AppShell>
        <div className="flex min-h-screen justify-center items-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  const { emotionOrAvoidanceSignals, energyNotes } = classifyResult

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 animate-fade-in">
        <div className="space-y-1 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-slate-200" />
            <div className="w-2 h-2 rounded-full bg-slate-200" />
            <div className="w-2 h-2 rounded-full bg-slate-200" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">지금 에너지가 어때요?</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            솔직하게 골라주세요. 선택에 따라<br />오늘 할 일 개수를 맞춰드려요.
          </p>
        </div>

        {(emotionOrAvoidanceSignals.length > 0 || energyNotes.length > 0) && (
          <Card variant="highlight" className="mb-6">
            <div className="space-y-2">
              {emotionOrAvoidanceSignals.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1">브레인덤프에서 감지된 신호</p>
                  <div className="flex flex-wrap gap-1.5">
                    {emotionOrAvoidanceSignals.map((sig, i) => (
                      <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {energyNotes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">에너지 힌트</p>
                  <div className="flex flex-wrap gap-1.5">
                    {energyNotes.map((note, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="flex-1 flex flex-col gap-3">
          {(['low', 'mid', 'high'] as EnergyLevel[]).map((level) => {
            const c = ENERGY_CONFIG[level]
            return (
              <button
                key={level}
                onClick={() => selectEnergy(level)}
                className="w-full text-left px-5 py-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl flex-shrink-0">{c.emoji}</span>
                  <div>
                    <p className="font-bold text-slate-800 text-base">{c.label}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{c.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 safe-bottom">
          <Button variant="secondary" onClick={() => router.push('/brain-dump')}>
            다시 작성하기
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
