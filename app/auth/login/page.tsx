'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { grantXP } from '@/lib/xp/reward'
import AppShell from '@/components/layout/AppShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          setMessage({ type: 'error', text: '이메일 또는 비밀번호를 다시 확인해볼까요?' })
          return
        }
        if (data.user) {
          await grantXP(supabase, data.user.id, 'nfc_tag')
        }
        router.push('/grounding')
        router.refresh()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nickname: nickname || null },
          },
        })
        if (error) {
          setMessage({ type: 'error', text: '가입 중 문제가 있었어요. 다시 시도해볼까요?' })
          return
        }
        if (data.user && !data.session) {
          setMessage({
            type: 'success',
            text: '이메일을 확인해주세요! 인증 링크를 보내드렸어요.',
          })
          return
        }
        router.push('/setup')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen py-8">
        <div className="flex-1 flex flex-col justify-center">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-300 rounded-2xl shadow-postit mx-auto mb-4 rotate-2">
              <span className="text-2xl">📝</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">10분 포스트잇</h1>
            <p className="text-sm text-slate-500 mt-1">XP를 쌓고 성장을 기록하세요</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-white rounded-2xl p-1 mb-6 shadow-sm border border-slate-100">
            <button
              type="button"
              onClick={() => { setMode('login'); setMessage(null) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-amber-400 text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setMessage(null) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-amber-400 text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* Form */}
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    닉네임 <span className="text-slate-400 font-normal">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="포스트잇러"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all bg-amber-50/30"
                    maxLength={20}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all bg-amber-50/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? '6자 이상 입력하세요' : '비밀번호를 입력하세요'}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all bg-amber-50/30"
                />
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`p-3 rounded-xl text-sm ${
                    message.type === 'error'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" loading={loading}>
                  {mode === 'login' ? '로그인하기' : '가입하고 시작하기'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Guest option */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400 mb-3">계정 없이도 사용할 수 있어요</p>
            <Link
              href="/grounding"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 underline underline-offset-2"
            >
              게스트로 체험하기
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
