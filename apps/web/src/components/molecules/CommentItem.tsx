import { useState } from 'react'
import { Avatar } from '../atoms/Avatar'
import type { CommentDto } from '../../services/post.service'

interface CommentItemProps {
  comment: CommentDto
  onReply?: (parentId: string, content: string) => Promise<void>
  isAuthenticated: boolean
}

export function CommentItem({ comment, onReply, isAuthenticated }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showReplies, setShowReplies] = useState(false)

  async function submitReply() {
    if (!replyText.trim() || !onReply) return
    await onReply(comment.id, replyText.trim())
    setReplyText('')
    setShowReplyForm(false)
    setShowReplies(true)
  }

  return (
    <div className="flex gap-3">
      <Avatar name={comment.author.name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-text">{comment.author.name}</span>
          <span className="text-xs text-text-muted">{comment.author.handle}</span>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">{comment.content}</p>
        {isAuthenticated && (
          <button
            onClick={() => setShowReplyForm((v) => !v)}
            className="mt-1 text-xs text-text-muted hover:text-accent"
          >
            Responder
          </button>
        )}

        {showReplyForm && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitReply()}
              placeholder="Escreva uma resposta..."
              aria-label="Escrever resposta"
              className="flex-1 text-sm bg-surface-input border border-border rounded px-3 py-1 outline-none focus:border-accent text-text placeholder:text-text-muted"
            />
            <button
              onClick={submitReply}
              disabled={!replyText.trim()}
              className="text-xs text-accent disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        )}

        {comment.replies.length > 0 && (
          <button
            onClick={() => setShowReplies((v) => !v)}
            className="mt-2 text-xs text-text-muted hover:text-accent"
          >
            {showReplies ? 'Ocultar' : `Ver ${comment.replies.length} resposta${comment.replies.length > 1 ? 's' : ''}`}
          </button>
        )}

        {showReplies && (
          <div className="mt-3 space-y-3 pl-4 border-l border-border">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar name={reply.author.name} size="sm" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-text">{reply.author.name}</span>
                    <span className="text-xs text-text-muted">{reply.author.handle}</span>
                  </div>
                  <p className="text-sm text-text-muted">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
