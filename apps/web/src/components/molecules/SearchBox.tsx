import { useState } from 'react'
import { MaterialIcon } from '../atoms/MaterialIcon'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBox({ value, onChange, placeholder = 'Buscar posts...' }: SearchBoxProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-input border transition-colors ${focused ? 'border-accent' : 'border-border'}`}
    >
      <MaterialIcon name="search" className="text-text-muted" size="sm" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label="Buscar posts"
        className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-muted"
      />
      {value && (
        <button
          aria-label="Limpar busca"
          onClick={() => onChange('')}
          className="text-text-muted hover:text-text"
        >
          <MaterialIcon name="close" size="sm" />
        </button>
      )}
    </div>
  )
}
