import React from 'react'
import { cn } from './Button'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'indigo'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    secondary: 'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200',
    outline: 'text-slate-900 border border-slate-200',
    success: 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
    warning: 'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200',
    danger: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
    indigo: 'border-transparent bg-indigo-600 text-white'
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
