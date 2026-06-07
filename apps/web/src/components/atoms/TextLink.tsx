import { Link } from 'react-router-dom'

interface TextLinkProps {
  children: React.ReactNode
  to?: string
  href?: string
  className?: string
}

export function TextLink({ children, to, href, className = '' }: TextLinkProps) {
  const base = `text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors ${className}`

  if (to) {
    return <Link to={to} className={base}>{children}</Link>
  }

  return (
    <a href={href ?? '#'} className={base}>
      {children}
    </a>
  )
}
