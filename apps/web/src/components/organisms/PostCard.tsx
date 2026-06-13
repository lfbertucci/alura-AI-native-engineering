import { Link } from 'react-router-dom'
import { Avatar } from '../atoms/Avatar'
import { PostThumbnail } from '../atoms/PostThumbnail'
import { TagChip } from '../atoms/TagChip'
import { PostStat } from '../molecules/PostStat'
import type { PostDto } from '../../services/post.service'
import { assetUrl } from '../../services/post.service'

interface PostCardProps {
  post: PostDto
  onLike?: () => void
  isAuthenticated: boolean
}

export function PostCard({ post, onLike, isAuthenticated }: PostCardProps) {
  return (
    <article className="bg-surface rounded-xl overflow-hidden flex flex-col">
      <Link to={`/posts/${post.id}`} className="block aspect-video overflow-hidden">
        <PostThumbnail
          src={assetUrl(post.thumbnailUrl)}
          title={post.title}
          className="w-full h-full"
        />
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <TagChip key={tag.id} label={tag.name} />
          ))}
        </div>

        <Link to={`/posts/${post.id}`} className="block">
          <h2 className="text-base font-semibold text-text hover:text-accent transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-sm text-text-muted mt-1 line-clamp-2">{post.description}</p>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Avatar name={post.author.name} size="sm" />
            <div>
              <p className="text-xs font-medium text-text">{post.author.name}</p>
              <p className="text-xs text-text-muted">{post.author.handle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
      </div>
    </article>
  )
}
