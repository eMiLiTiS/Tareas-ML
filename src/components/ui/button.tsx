import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-sm hover:shadow focus:ring-2 focus:ring-rose-300 focus:ring-offset-1',
  secondary:
    'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 active:bg-stone-100 shadow-sm focus:ring-2 focus:ring-stone-200 focus:ring-offset-1',
  ghost:
    'bg-transparent text-stone-600 hover:bg-stone-100 active:bg-stone-200 focus:ring-2 focus:ring-stone-200 focus:ring-offset-1',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow focus:ring-2 focus:ring-red-300 focus:ring-offset-1',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-medium rounded-xl',
  lg: 'px-6 py-3 text-base font-semibold rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 transition-all duration-150 outline-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
