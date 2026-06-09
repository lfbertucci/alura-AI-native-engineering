import type { LabelHTMLAttributes } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export function Label({ children, className = '', ...rest }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-text-muted mb-1 ${className}`}
      {...rest}
    >
      {children}
    </label>
  )
}
