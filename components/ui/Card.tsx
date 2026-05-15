import { HTMLAttributes } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'postit' | 'highlight'
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({
  variant = 'default',
  padding = 'lg',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl',
        {
          // Variants
          'bg-white shadow-card border border-slate-100': variant === 'default',
          'bg-amber-300 shadow-postit': variant === 'postit',
          'bg-amber-50 border-2 border-amber-300': variant === 'highlight',
          // Padding
          'p-4': padding === 'sm',
          'p-5': padding === 'md',
          'p-6': padding === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
