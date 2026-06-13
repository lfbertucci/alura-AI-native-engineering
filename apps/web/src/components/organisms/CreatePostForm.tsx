import { useState, useRef, type FormEvent } from 'react'
import { Button } from '../atoms/Button'
import { TagChip } from '../atoms/TagChip'
import { extractApiError } from '../../services/auth.service'
import type { PostTag } from '../../services/post.service'

interface CreatePostFormProps {
  availableTags: PostTag[]
  onSubmit: (data: FormData) => Promise<void>
  onDiscard: () => void
}

export function CreatePostForm({ availableTags, onSubmit, onDiscard }: CreatePostFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function toggleTag(name: string) {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Título e descrição são obrigatórios.')
      return
    }

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    if (code.trim()) formData.append('code', code.trim())
    selectedTags.forEach((t) => formData.append('tags', t))
    if (thumbnail) formData.append('thumbnail', thumbnail)

    try {
      setLoading(true)
      setError('')
      await onSubmit(formData)
    } catch (err) {
      setError(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="post-title" className="block text-sm font-medium text-text mb-1">
          Título *
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome do projeto"
          className="w-full text-sm bg-surface-input border border-border rounded-lg px-4 py-2 outline-none focus:border-accent text-text placeholder:text-text-muted"
        />
      </div>

      <div>
        <label htmlFor="post-description" className="block text-sm font-medium text-text mb-1">
          Descrição *
        </label>
        <textarea
          id="post-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva seu projeto..."
          className="w-full text-sm bg-surface-input border border-border rounded-lg px-4 py-2 outline-none focus:border-accent text-text placeholder:text-text-muted resize-none"
        />
      </div>

      <div>
        <label htmlFor="post-code" className="block text-sm font-medium text-text mb-1">
          Código (opcional)
        </label>
        <textarea
          id="post-code"
          rows={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Cole um trecho de código..."
          className="w-full text-sm font-mono bg-code-bg border border-border rounded-lg px-4 py-2 outline-none focus:border-accent text-code-text placeholder:text-text-muted resize-none"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-text mb-2">Imagem de capa</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          aria-label="Carregar imagem"
          onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-text-muted hover:border-accent hover:text-accent transition-colors"
        >
          <span className="material-icons text-base">upload</span>
          {thumbnail ? thumbnail.name : 'Carregar imagem'}
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-text mb-2">Tags</p>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <TagChip
              key={tag.id}
              label={tag.name}
              active={selectedTags.includes(tag.name)}
              onClick={() => toggleTag(tag.name)}
            />
          ))}
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-error">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onDiscard}
          className="flex-1 py-2 text-sm font-medium text-text-muted border border-border rounded-lg hover:border-text transition-colors"
        >
          Descartar
        </button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Publicando...' : 'Publicar'}
        </Button>
      </div>
    </form>
  )
}
