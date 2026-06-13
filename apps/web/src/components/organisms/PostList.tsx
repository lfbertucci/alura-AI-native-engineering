import { PostCard } from './PostCard'
import type { PostDto } from '../../services/post.service'

interface PostListProps {
  posts: PostDto[]
  isAuthenticated: boolean
  onLike: (postId: string) => void
}

export function PostList({ posts, isAuthenticated, onLike }: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-text-muted text-center py-16">
        Nenhum post encontrado.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isAuthenticated={isAuthenticated}
          onLike={() => onLike(post.id)}
        />
      ))}
    </div>
  )
}
