import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppTemplate } from '../templates/AppTemplate'
import { PostDetailCard } from '../organisms/PostDetailCard'
import { CodeBlock } from '../organisms/CodeBlock'
import { CommentsSection } from '../organisms/CommentsSection'
import { useAuth } from '../../hooks/useAuth'
import { postService, type PostDetailDto } from '../../services/post.service'

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const auth = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState<PostDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    postService
      .getPost(id)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function handleLike() {
    if (!auth.isAuthenticated) {
      navigate('/login')
      return
    }
    if (!post) return
    try {
      if (post.likedByMe) {
        await postService.unlikePost(post.id)
      } else {
        await postService.likePost(post.id)
      }
      setPost((p) =>
        p
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              counts: { ...p.counts, likes: p.counts.likes + (p.likedByMe ? -1 : 1) },
            }
          : p,
      )
    } catch {
      // silently ignore
    }
  }

  async function handleAddComment(content: string, parentId?: string) {
    if (!post) return
    const newComment = await postService.createComment(post.id, { content, parentId })
    setPost((p) => {
      if (!p) return p
      if (parentId) {
        return {
          ...p,
          comments: p.comments.map((c) =>
            c.id === parentId ? { ...c, replies: [...c.replies, newComment] } : c,
          ),
        }
      }
      return { ...p, comments: [...p.comments, newComment] }
    })
  }

  return (
    <AppTemplate>
      <div className="max-w-2xl mx-auto space-y-8">
        {loading && <p className="text-text-muted text-center py-16">Carregando...</p>}
        {notFound && <p className="text-text-muted text-center py-16">Post não encontrado.</p>}
        {post && (
          <>
            <PostDetailCard post={post} isAuthenticated={auth.isAuthenticated} onLike={handleLike} />
            {post.code && <CodeBlock code={post.code} />}
            <CommentsSection
              postId={post.id}
              comments={post.comments}
              isAuthenticated={auth.isAuthenticated}
              onAddComment={handleAddComment}
            />
          </>
        )}
      </div>
    </AppTemplate>
  )
}
