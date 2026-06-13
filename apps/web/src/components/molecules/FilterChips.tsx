import { TagChip } from '../atoms/TagChip'
import type { PostTag } from '../../services/post.service'

interface FilterChipsProps {
  tags: PostTag[]
  selected: string[]
  onToggle: (name: string) => void
  onClear: () => void
}

export function FilterChips({ tags, selected, onToggle, onClear }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <TagChip
          key={tag.id}
          label={tag.name}
          active={selected.includes(tag.name)}
          onClick={() => onToggle(tag.name)}
        />
      ))}
      {selected.length > 0 && (
        <button
          onClick={onClear}
          className="text-xs text-text-muted hover:text-text underline ml-1"
        >
          Limpar tudo
        </button>
      )}
    </div>
  )
}
