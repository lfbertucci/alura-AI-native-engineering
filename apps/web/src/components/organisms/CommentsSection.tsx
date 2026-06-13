import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CommentItem } from '../molecules/CommentItem'
import type { CommentDto } from '../../services/post.service'

interface CommentsSectionProps {
  postId: string
  comments: CommentDto[]
  isAuthenticated: boolean
  onAddComment: (content: string, parentId?: string) => Promise<void>
}

export function CommentsSection({
  postId: _postId,
  comments,
  isAuthenticated,
  onAddComment,
}: CommentsSectionProps) {
  const [text, setText] = useState('')

  async function submit() {
    if (!text.trim()) return
    await onAddComment(text.trim())
    setText('')
  }

  return (
    <section aria-label="Comentários">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
        Comentários ({comments.length})
      </h3>

      {isAuthenticated ? (
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Adicione um comentário..."
            aria-label="Escrever comentário"
            className="flex-1 text-sm bg-surface-input border border-border rounded-lg px-4 py-2 outline-none focus:border-accent text-text placeholder:text-text-muted"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="px-4 py-2 bg-accent text-text-on-dark text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-accent-hover transition-colors"
          >
            Publicar
          </button>
        </div>
      ) : (
        <p className="text-sm text-text-muted mb-6">
          <Link to="/login" className="text-accent hover:underline">
            Faça login
          </Link>{' '}
          para comentar.
        </p>
      )}

      <div className="space-y-5">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isAuthenticated={isAuthenticated}
            onReply={isAuthenticated ? (parentId, content) => onAddComment(content, parentId) : undefined}
          />
        ))}
      </div>
    </section>
  )
}
