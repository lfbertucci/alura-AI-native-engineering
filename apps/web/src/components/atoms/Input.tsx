import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export function Input({ hasError = false, className = '', ...rest }: InputProps) {
  return (
    <input
      className={`w-full px-4 py-3 rounded-lg bg-surface-input text-text placeholder:text-text-subtle border ${
        hasError ? 'border-error' : 'border-border'
      } focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm ${className}`}
      aria-invalid={hasError || undefined}
      {...rest}
    />
  )
}
