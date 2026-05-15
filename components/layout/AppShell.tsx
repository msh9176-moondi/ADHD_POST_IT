import { HTMLAttributes } from 'react'
import clsx from 'clsx'
import BottomNav from './BottomNav'

interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  centered?: boolean
}

export default function AppShell({
  children,
  centered = false,
  className,
  ...props
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-amber-50">
      <div
        className={clsx(
          'max-w-[430px] mx-auto min-h-screen px-4 py-6 pb-24',
          {
            'flex flex-col items-center justify-center': centered,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
