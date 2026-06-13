import { MaterialIcon } from '../atoms/MaterialIcon'

interface PostStatProps {
  icon: string
  count: number
  label: string
  active?: boolean
  onClick?: () => void
}

export function PostStat({ icon, count, label, active = false, onClick }: PostStatProps) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={!onClick}
      className={`flex items-center gap-1 text-sm transition-colors disabled:cursor-default
        ${active ? 'text-accent' : 'text-text-muted hover:text-text'}`}
    >
      <MaterialIcon name={icon} size="sm" />
      <span>{count}</span>
    </button>
  )
}
