interface DividerProps {
  label?: string
}

export function Divider({ label }: DividerProps) {
  return (
    <div className="flex items-center gap-3 my-2">
      <hr className="flex-1 border-border" />
      {label && (
        <span className="text-xs text-text-muted whitespace-nowrap">{label}</span>
      )}
      <hr className="flex-1 border-border" />
    </div>
  )
}
