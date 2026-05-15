import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'

export default function LandingPage() {
  return (
    <AppShell>
      {/* Hero Section */}
      <div className="flex flex-col min-h-screen py-8">
        <div className="flex-1 flex flex-col justify-center space-y-8">
          {/* Logo / Title */}
          <div className="text-center space-y-3 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-300 rounded-2xl shadow-postit mx-auto mb-2 rotate-2">
              <span className="text-4xl">📝</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
              10분 포스트잇
            </h1>
            <p className="text-base text-slate-500 leading-relaxed px-4">
              머릿속 혼란을 포스트잇 한 장의<br />
              <strong className="text-amber-600">10분 행동</strong>으로 바꾸는<br />
              ADHD 계획작성 도구
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 justify-center px-2 animate-slide-up">
            {[
              { icon: '🧠', text: '브레인 덤프' },
              { icon: '✨', text: 'AI 분석' },
              { icon: '📌', text: '포스트잇 문장' },
              { icon: '⏱️', text: '10분 타이머' },
              { icon: '🎁', text: 'XP 보상' },
            ].map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-1 bg-white rounded-full px-3 py-1.5 text-sm text-slate-600 shadow-sm border border-slate-100"
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </span>
            ))}
          </div>

          {/* Post-it visual */}
          <div className="px-4 animate-slide-up">
            <div className="bg-amber-300 rounded-2xl shadow-postit p-6 rotate-1 max-w-xs mx-auto">
              <p className="text-slate-800 font-bold text-lg leading-snug">
                포트폴리오 폴더 열고<br />
                첫 번째 슬라이드 제목 쓰기.<br />
                <span className="text-amber-700">10분만.</span>
              </p>
              <div className="mt-3 text-right text-xs text-amber-600 opacity-70">
                오늘의 포스트잇
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-3 px-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center">
              이렇게 사용해요
            </p>
            <div className="space-y-2">
              {[
                { step: '01', desc: '머릿속에 있는 것을 전부 쏟아내기' },
                { step: '02', desc: 'AI가 10분 행동 문장 하나로 줄여주기' },
                { step: '03', desc: '포스트잇에 손으로 적고 바로 시작' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm"
                >
                  <span className="text-xs font-bold text-amber-500 bg-amber-100 rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </span>
                  <span className="text-sm text-slate-600">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-6 pb-4 safe-bottom">
          <Link
            href="/brain-dump"
            className="block w-full py-4 px-6 text-lg font-semibold text-center text-slate-800 bg-amber-400 rounded-full shadow-md hover:bg-amber-500 active:bg-amber-600 transition-all"
          >
            NFC 없이 체험하기
          </Link>
          <Link
            href="/auth/login"
            className="block w-full py-4 px-6 text-lg font-semibold text-center text-slate-700 bg-white rounded-full border-2 border-slate-200 hover:border-amber-400 hover:text-amber-700 transition-all"
          >
            로그인하기
          </Link>
          <p className="text-center text-xs text-slate-400 mt-2">
            로그인하면 XP 보상과 성장 기록을 저장할 수 있어요
          </p>
        </div>
      </div>
    </AppShell>
  )
}
