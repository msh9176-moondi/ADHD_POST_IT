'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function SetupPage() {
  const router = useRouter()
  const [planTime, setPlanTime] = useState('09:00')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }

      // Check if plan_time is already set
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_time')
        .eq('id', user.id)
        .single()

      if (profile?.plan_time) {
        // Already set up, go to brain-dump
        router.replace('/brain-dump')
        return
      }

      setChecking(false)
    }

    checkAuth()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ plan_time: planTime })
        .eq('id', user.id)

      if (error) {
        console.error('Error saving plan time:', error)
        return
      }

      router.push('/guide?from=setup')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <AppShell>
        <div className="flex min-h-screen justify-center items-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  const getTimeLabel = (time: string) => {
    const [h] = time.split(':').map(Number)
    if (h >= 5 && h < 12) return '아침 계획 루틴이네요 ☀️'
    if (h >= 12 && h < 14) return '점심 시간에 계획을 세우는군요 🌤️'
    if (h >= 14 && h < 18) return '오후에 리셋하는 루틴이네요 🌤️'
    if (h >= 18 && h < 22) return '저녁에 내일을 준비하는군요 🌙'
    return '늦은 밤에 계획하는군요 🌙'
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-8">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full flex-1 ${step === 1 ? 'bg-amber-400' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        <div className="flex-1 space-y-8 animate-fade-in">
          {/* Header */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-600">첫 번째 설정</p>
            <h1 className="text-2xl font-bold text-slate-800 leading-snug">
              매일 몇 시에<br />포스트잇 계획을 작성할까요?
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              알림을 보내지는 않아요. 다만 이 시간을 기억해두면<br />
              루틴이 더 쉽게 자리잡아요.
            </p>
          </div>

          {/* Time Input */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600">
                    계획 작성 시간
                  </label>
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    {getTimeLabel(planTime)}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="time"
                    value={planTime}
                    onChange={(e) => setPlanTime(e.target.value)}
                    className="w-full text-3xl font-bold text-center text-slate-800 bg-amber-50 border-2 border-amber-200 rounded-2xl py-6 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer"
                  />
                </div>

                {/* Quick time presets */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '아침', time: '08:00' },
                    { label: '점심', time: '12:00' },
                    { label: '저녁', time: '19:00' },
                    { label: '밤', time: '22:00' },
                  ].map((preset) => (
                    <button
                      key={preset.time}
                      type="button"
                      onClick={() => setPlanTime(preset.time)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        planTime === preset.time
                          ? 'bg-amber-400 text-slate-800'
                          : 'bg-slate-100 text-slate-500 hover:bg-amber-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Why this matters */}
            <Card variant="highlight">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700">루틴 시간의 힘</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ADHD가 있어도 같은 시간에 반복하면<br />
                    &apos;지금 해야 할 때다&apos;는 신호가 뇌에 형성돼요.
                  </p>
                </div>
              </div>
            </Card>

            {/* Submit */}
            <div className="pt-4">
              <Button type="submit" loading={loading}>
                저장하고 시작하기 →
              </Button>
              <button
                type="button"
                onClick={() => router.push('/brain-dump')}
                className="w-full mt-3 py-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                지금은 건너뛰기
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
