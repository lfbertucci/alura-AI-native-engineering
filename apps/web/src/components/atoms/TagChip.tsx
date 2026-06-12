interface TagChipProps {
  label: string
  active?: boolean
  onRemove?: () => void
  onClick?: () => void
}

export function TagChip({ label, active = false, onRemove, onClick }: TagChipProps) {
  return (
    <span
      role="button"
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium cursor-pointer select-none transition-colors
        ${active ? 'bg-accent text-text-on-dark' : 'bg-tag-bg text-tag-text hover:bg-accent hover:text-text-on-dark'}`}
    >
      {label}
      {onRemove && (
        <button
          aria-label={`Remover tag ${label}`}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 leading-none hover:text-text-on-dark"
        >
          ×
        </button>
      )}
    </span>
  )
}
