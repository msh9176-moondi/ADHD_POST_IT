'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/brain-dump',
    label: '브레인덤프',
    icon: (active: boolean) => (
      <svg className={['w-6 h-6', active ? 'text-amber-500' : 'text-slate-400'].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: '/daily-plan',
    label: '계획표',
    icon: (active: boolean) => (
      <svg className={['w-6 h-6', active ? 'text-amber-500' : 'text-slate-400'].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: '프로필',
    icon: (active: boolean) => (
      <svg className={['w-6 h-6', active ? 'text-amber-500' : 'text-slate-400'].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

// 위자드 플로우 중간 페이지는 네비게이션 숨김
const HIDDEN_PATHS = ['/energy-select', '/task-select', '/postit-loop', '/time-arrange', '/auth', '/setup', '/guide', '/grounding', '/scan', '/timer', '/postit-location', '/write-postit']

export default function BottomNav() {
  const pathname = usePathname()

  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-[430px] mx-auto">
        <nav className="bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 flex flex-col items-center gap-1 pt-3 pb-1 transition-opacity active:opacity-60"
                >
                  {item.icon(active)}
                  <span className={[
                    'text-[10px] font-medium tracking-tight',
                    active ? 'text-amber-500' : 'text-slate-400',
                  ].join(' ')}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
