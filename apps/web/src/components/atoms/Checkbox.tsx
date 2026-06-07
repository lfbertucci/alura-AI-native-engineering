interface CheckboxProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Checkbox({ id, label, checked, onChange }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span className="w-4 h-4 rounded border border-[var(--color-border)] bg-[var(--color-surface-input)] peer-checked:bg-[var(--color-accent)] peer-checked:border-[var(--color-accent)] flex items-center justify-center flex-shrink-0 transition-colors">
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
            <path d="M1 4l3 3 5-6" stroke="#0d0f14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
    </label>
  )
}
