import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'lg',
      fullWidth = true,
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            // Variants
            'bg-amber-400 text-slate-800 hover:bg-amber-500 active:bg-amber-600 focus:ring-amber-400 shadow-md hover:shadow-lg':
              variant === 'primary',
            'bg-white text-slate-700 border-2 border-slate-200 hover:border-amber-400 hover:text-amber-700 focus:ring-slate-300':
              variant === 'secondary',
            'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:ring-slate-300':
              variant === 'ghost',
            // Sizes
            'py-2 px-4 text-sm': size === 'sm',
            'py-3 px-5 text-base': size === 'md',
            'py-4 px-6 text-lg': size === 'lg',
            // Full width
            'w-full': fullWidth,
            // Disabled
            'opacity-50 cursor-not-allowed': disabled || loading,
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
