import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppTemplate } from '../templates/AppTemplate'
import { SearchBox } from '../molecules/SearchBox'
import { FilterChips } from '../molecules/FilterChips'
import { PostList } from '../organisms/PostList'
import { useAuth } from '../../hooks/useAuth'
import { postService, type PostDto, type PostTag } from '../../services/post.service'

export function FeedPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostDto[]>([])
  const [tags, setTags] = useState<PostTag[]>([])
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    postService.getTags().then(setTags).catch(() => {})
  }, [])

  const fetchPosts = useCallback(() => {
    setLoading(true)
    postService
      .getPosts({ search: search || undefined, tags: selectedTags.length ? selectedTags : undefined })
      .then((res) => setPosts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, selectedTags])

  useEffect(() => {
    const timer = setTimeout(fetchPosts, 300)
    return () => clearTimeout(timer)
  }, [fetchPosts])

  function toggleTag(name: string) {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
    )
  }

  async function handleLike(postId: string) {
    if (!auth.isAuthenticated) {
      navigate('/login')
      return
    }
    const post = posts.find((p) => p.id === postId)
    if (!post) return
    try {
      if (post.likedByMe) {
        await postService.unlikePost(postId)
      } else {
        await postService.likePost(postId)
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByMe: !p.likedByMe,
                counts: {
                  ...p.counts,
                  likes: p.counts.likes + (p.likedByMe ? -1 : 1),
                },
              }
            : p,
        ),
      )
    } catch {
      // silently ignore like errors
    }
  }

  return (
    <AppTemplate>
      <div className="max-w-3xl mx-auto space-y-6">
        <SearchBox value={search} onChange={setSearch} />
        <FilterChips
          tags={tags}
          selected={selectedTags}
          onToggle={toggleTag}
          onClear={() => setSelectedTags([])}
        />
        {loading ? (
          <p className="text-text-muted text-center py-16">Carregando...</p>
        ) : (
          <PostList
            posts={posts}
            isAuthenticated={auth.isAuthenticated}
            onLike={handleLike}
          />
        )}
      </div>
    </AppTemplate>
  )
}
