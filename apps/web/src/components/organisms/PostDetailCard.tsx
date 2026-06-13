import { Avatar } from '../atoms/Avatar'
import { PostThumbnail } from '../atoms/PostThumbnail'
import { TagChip } from '../atoms/TagChip'
import { PostStat } from '../molecules/PostStat'
import type { PostDetailDto } from '../../services/post.service'
import { assetUrl } from '../../services/post.service'

interface PostDetailCardProps {
  post: PostDetailDto
  isAuthenticated: boolean
  onLike: () => void
}

export function PostDetailCard({ post, isAuthenticated, onLike }: PostDetailCardProps) {
  return (
    <article>
      <div className="aspect-video w-full overflow-hidden rounded-xl mb-6">
        <PostThumbnail
          src={assetUrl(post.thumbnailUrl)}
          title={post.title}
          className="w-full h-full"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <TagChip key={tag.id} label={tag.name} />
        ))}
      </div>

      <h1 className="text-2xl font-bold text-text mb-2">{post.title}</h1>
      <p className="text-text-muted leading-relaxed mb-6">{post.description}</p>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-3">
          <Avatar name={post.author.name} size="md" />
          <div>
            <p className="text-sm font-medium text-text">{post.author.name}</p>
            <p className="text-xs text-text-muted">{post.author.handle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <PostStat
            icon={post.likedByMe ? 'favorite' : 'favorite_border'}
            count={post.counts.likes}
            label={isAuthenticated ? 'Curtir' : 'Curtidas'}
            active={post.likedByMe}
            onClick={isAuthenticated ? onLike : undefined}
          />
          <PostStat
            icon="chat_bubble_outline"
            count={post.counts.comments}
            label="Comentários"
          />
        </div>
      </div>
    </article>
  )
}
