import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export function Input({ hasError = false, className = '', ...rest }: InputProps) {
  return (
    <input
      className={`w-full px-4 py-3 rounded-lg bg-[var(--color-surface-input)] text-[var(--color-text)] placeholder-[var(--color-text-subtle)] border ${
        hasError ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'
      } focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-sm ${className}`}
      aria-invalid={hasError || undefined}
      {...rest}
    />
  )
}
