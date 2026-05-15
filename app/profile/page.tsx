'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import XPBar from '@/components/ui/XPBar'

interface ProfileStats {
  todayXp: number
  weekPlanCount: number
  streakDays: number
}

function getTreeEmoji(level: number): string {
  if (level <= 1) return '🌱'
  if (level <= 3) return '🌿'
  if (level <= 6) return '🌳'
  if (level <= 10) return '🌲'
  return '🎄'
}

function getTreeLabel(level: number): string {
  if (level <= 1) return '새싹 포스트잇러'
  if (level <= 3) return '성장하는 포스트잇러'
  if (level <= 6) return '꾸준한 포스트잇러'
  if (level <= 10) return '숙련된 포스트잇러'
  return '전설의 포스트잇러'
}

function getLevelColor(level: number): string {
  if (level <= 1) return 'text-green-500'
  if (level <= 3) return 'text-teal-500'
  if (level <= 6) return 'text-amber-600'
  if (level <= 10) return 'text-slate-700'
  return 'text-purple-600'
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<ProfileStats>({ todayXp: 0, weekPlanCount: 0, streakDays: 0 })
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsGuest(true)
        setLoading(false)
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) setProfile(profileData)

      // Load today's XP
      const today = new Date().toISOString().slice(0, 10)
      const { data: todayLogs } = await supabase
        .from('reward_logs')
        .select('xp')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)

      const todayXp = todayLogs?.reduce((sum, l) => sum + (l.xp || 0), 0) ?? 0

      // Load this week's plan count
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data: weekPlans } = await supabase
        .from('plan_sentences')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString())

      const weekPlanCount = weekPlans?.length ?? 0

      // Calculate streak days (consecutive NFC days)
      const { data: nfcLogs } = await supabase
        .from('nfc_logs')
        .select('accessed_at')
        .eq('user_id', user.id)
        .order('accessed_at', { ascending: false })
        .limit(30)

      let streakDays = 0
      if (nfcLogs && nfcLogs.length > 0) {
        const uniqueDays = [...new Set(nfcLogs.map((l) => l.accessed_at.slice(0, 10)))]
        const currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)

        for (let i = 0; i < uniqueDays.length; i++) {
          const logDate = new Date(uniqueDays[i])
          logDate.setHours(0, 0, 0, 0)
          const expectedDate = new Date(currentDate)
          expectedDate.setDate(currentDate.getDate() - i)

          if (logDate.getTime() === expectedDate.getTime()) {
            streakDays++
          } else {
            break
          }
        }
      }

      setStats({ todayXp, weekPlanCount, streakDays })
      setLoading(false)
    }

    loadProfile()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-screen justify-center items-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  if (isGuest) {
    return (
      <AppShell>
        <div className="flex flex-col min-h-screen py-6 justify-center items-center text-center space-y-6">
          <div className="text-5xl">🌱</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-800">성장 기록을 저장하려면</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              로그인하면 XP, 스트릭, 계획 기록을<br />모두 저장할 수 있어요.
            </p>
          </div>
          <div className="w-full space-y-3">
            <Link
              href="/auth/login"
              className="block w-full py-4 text-lg font-semibold text-center text-slate-800 bg-amber-400 rounded-full"
            >
              로그인하러 가기
            </Link>
            <Link
              href="/brain-dump"
              className="block w-full py-4 text-lg font-semibold text-center text-slate-600 bg-white rounded-full border-2 border-slate-200"
            >
              계속 체험하기
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  const totalXp = profile?.total_xp ?? 0
  const level = Math.floor(totalXp / 100) + 1
  const treeEmoji = getTreeEmoji(level)
  const treeLabel = getTreeLabel(level)
  const levelColor = getLevelColor(level)
  const nickname = profile?.nickname || '익명의 포스트잇러'

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">나의 성장</h1>
          <button
            onClick={() => router.push('/brain-dump')}
            className="text-sm text-amber-600 font-medium hover:text-amber-700 transition-colors"
          >
            오늘 계획 만들기 →
          </button>
        </div>

        {/* Profile Card */}
        <Card>
          <div className="flex items-center gap-4">
            {/* Tree avatar */}
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">{treeEmoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-lg truncate">{nickname}</p>
              <p className={`text-sm font-medium ${levelColor}`}>
                레벨 {level} · {treeLabel}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                총 {totalXp} XP 획득
              </p>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-5">
            <XPBar totalXp={totalXp} />
          </div>
        </Card>

        {/* Today's summary */}
        <Card variant="highlight">
          <div className="space-y-3">
            <p className="section-title">오늘</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-2xl font-bold text-slate-800">+{stats.todayXp} XP</p>
                <p className="text-xs text-slate-500">오늘 획득한 경험치</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak */}
          <Card padding="md">
            <div className="text-center space-y-1">
              <div className="text-2xl">
                {stats.streakDays >= 3 ? '🔥' : stats.streakDays >= 1 ? '✨' : '💤'}
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats.streakDays}일</p>
              <p className="text-xs text-slate-400">NFC 연속 태깅</p>
              {stats.streakDays >= 3 && (
                <span className="text-xs text-amber-600 font-medium">
                  스트릭 진행 중!
                </span>
              )}
            </div>
          </Card>

          {/* Week plans */}
          <Card padding="md">
            <div className="text-center space-y-1">
              <div className="text-2xl">📝</div>
              <p className="text-2xl font-bold text-slate-800">{stats.weekPlanCount}개</p>
              <p className="text-xs text-slate-400">이번 주 계획 문장</p>
            </div>
          </Card>
        </div>

        {/* Tree Growth Visual */}
        <Card>
          <div className="space-y-3">
            <p className="section-title">성장 나무</p>
            <div className="flex justify-around items-end py-2">
              {[
                { emoji: '🌱', label: '새싹', level: 1 },
                { emoji: '🌿', label: '새잎', level: 3 },
                { emoji: '🌳', label: '나무', level: 6 },
                { emoji: '🌲', label: '거목', level: 10 },
              ].map((tree) => (
                <div
                  key={tree.level}
                  className={`text-center transition-all ${
                    level >= tree.level ? 'opacity-100' : 'opacity-30 grayscale'
                  }`}
                >
                  <div
                    className={`text-${level >= tree.level ? '3xl' : '2xl'} transition-all`}
                  >
                    {tree.emoji}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Lv.{tree.level}</p>
                  {level === tree.level && (
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mx-auto mt-1" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-slate-400">
              레벨 {level} · 다음 레벨까지 {100 - (totalXp % 100)} XP
            </p>
          </div>
        </Card>

        {/* Plan time */}
        {profile?.plan_time && (
          <Card>
            <div className="flex items-center gap-3">
              <span className="text-xl">⏰</span>
              <div>
                <p className="text-sm font-medium text-slate-700">계획 작성 시간</p>
                <p className="text-lg font-bold text-slate-800">{profile.plan_time}</p>
              </div>
              <Link
                href="/setup"
                className="ml-auto text-xs text-slate-400 hover:text-amber-600 transition-colors"
              >
                변경
              </Link>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="pt-4 pb-6 space-y-3 safe-bottom">
          <Button onClick={() => router.push('/brain-dump')}>
            오늘 계획 만들러 가기
          </Button>
          <Button variant="secondary" onClick={() => router.push('/guide')}>
            📖 포스트잇 활용 가이드 보기
          </Button>
          <Button variant="ghost" onClick={handleSignOut} fullWidth size="md">
            로그아웃
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
