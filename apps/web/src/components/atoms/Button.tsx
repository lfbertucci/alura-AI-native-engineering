import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary'
}

export function Button({ children, variant = 'primary', className = '', disabled, ...rest }: ButtonProps) {
  const base =
    'w-full py-3 px-6 rounded-lg font-semibold text-base transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer'
  const styles =
    variant === 'primary'
      ? 'bg-[var(--color-accent)] text-[#0d0f14] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed'
      : ''

  return (
    <button className={`${base} ${styles} ${className}`} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}
