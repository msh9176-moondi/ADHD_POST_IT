'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { REWARD_XP, RewardType } from '@/types'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface XPBadge {
  type: RewardType
  label: string
  icon: string
  xp: number
  earned: boolean
}

export default function RewardPage() {
  const router = useRouter()
  const [badges, setBadges] = useState<XPBadge[]>([])
  const [todayXp, setTodayXp] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const allBadges: XPBadge[] = [
        { type: 'nfc_tag', label: 'NFC 태깅', icon: '🏷️', xp: REWARD_XP.nfc_tag, earned: false },
        { type: 'brain_dump', label: '브레인 덤프', icon: '🧠', xp: REWARD_XP.brain_dump, earned: false },
        { type: 'plan_sentence', label: '계획 문장', icon: '✨', xp: REWARD_XP.plan_sentence, earned: false },
        { type: 'postit_written', label: '포스트잇 작성', icon: '📝', xp: REWARD_XP.postit_written, earned: false },
      ]

      if (user) {
        const today = new Date().toISOString().slice(0, 10)
        const { data: logs } = await supabase
          .from('reward_logs')
          .select('reward_type, xp')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)

        if (logs) {
          const earnedTypes = new Set(logs.map((l) => l.reward_type))
          const totalXp = logs.reduce((sum, l) => sum + (l.xp || 0), 0)
          setTodayXp(totalXp)
          setBadges(allBadges.map((b) => ({ ...b, earned: earnedTypes.has(b.type) })))
        } else {
          setBadges(allBadges)
        }
      } else {
        const guestEarned = new Set(['brain_dump', 'plan_sentence'])
        const guestXp = REWARD_XP.brain_dump + REWARD_XP.plan_sentence
        setTodayXp(guestXp)
        setBadges(allBadges.map((b) => ({ ...b, earned: guestEarned.has(b.type) })))
      }

      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
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
      <div className="flex flex-col min-h-screen py-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-5xl animate-bounce-gentle">🎊</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              오늘의 10분 행동 문장이<br />완성됐어요.
            </h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              완료보다 중요한 건 다시 돌아온 것입니다.
            </p>
          </div>
        </div>

        {/* Today XP */}
        <div className="bg-amber-400 rounded-2xl p-5 text-center shadow-md">
          <p className="text-slate-700 text-sm font-medium">오늘 획득한 XP</p>
          <p className="text-5xl font-bold text-slate-800 mt-1">+{todayXp}</p>
          <p className="text-amber-700 text-xs mt-1">XP</p>
        </div>

        {/* XP Badges */}
        <Card>
          <div className="space-y-3">
            <p className="section-title">오늘의 달성 배지</p>
            <div className="grid grid-cols-2 gap-2">
              {badges.map((badge) => (
                <div
                  key={badge.type}
                  className={`flex items-center gap-2.5 p-3 rounded-xl transition-all ${
                    badge.earned
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-slate-50 border border-slate-100 opacity-50'
                  }`}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <p className={`text-xs font-medium ${badge.earned ? 'text-slate-700' : 'text-slate-400'}`}>
                      {badge.label}
                    </p>
                    <p className={`text-xs ${badge.earned ? 'text-amber-600 font-bold' : 'text-slate-300'}`}>
                      {badge.earned ? `+${badge.xp} XP` : `${badge.xp} XP`}
                    </p>
                  </div>
                  {badge.earned && (
                    <span className="ml-auto text-amber-500 text-sm">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Encouragement */}
        <Card variant="highlight">
          <div className="flex items-start gap-3">
            <span className="text-xl">💪</span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-700">내일도 여기서 만나요</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                오늘 포스트잇 하나 붙인 것으로 충분해요.<br />
                NFC를 다시 태깅하면 스트릭이 쌓여요.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="pt-2 pb-6 space-y-3 safe-bottom">
          <Button onClick={() => router.push('/timer')}>
            이제 시작해볼까요? →
          </Button>
          <Button variant="secondary" onClick={() => router.push('/profile')}>
            오늘은 여기까지
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
