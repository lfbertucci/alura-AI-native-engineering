import { api } from './api'

export interface PostAuthor {
  id: string
  name: string
  handle: string
}

export interface PostTag {
  id: string
  name: string
}

export interface PostDto {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  tags: PostTag[]
  author: PostAuthor
  counts: { likes: number; comments: number }
  likedByMe: boolean
  createdAt: string
}

export interface CommentDto {
  id: string
  content: string
  author: PostAuthor
  createdAt: string
  replies: CommentDto[]
}

export interface PostDetailDto extends PostDto {
  code: string | null
  comments: CommentDto[]
}

export interface GetPostsParams {
  search?: string
  tags?: string[]
  page?: number
  limit?: number
}

export interface PaginatedPosts {
  data: PostDto[]
  total: number
  page: number
  limit: number
}

export const postService = {
  getPosts(params: GetPostsParams = {}): Promise<PaginatedPosts> {
    const searchParams: Record<string, string> = {}
    if (params.search) searchParams.search = params.search
    if (params.page != null) searchParams.page = String(params.page)
    if (params.limit != null) searchParams.limit = String(params.limit)

    let url = '/posts'
    const qs = new URLSearchParams(searchParams)
    if (params.tags?.length) {
      params.tags.forEach((t) => qs.append('tags', t))
    }
    const qsStr = qs.toString()
    if (qsStr) url += '?' + qsStr

    return api.get<PaginatedPosts>(url).then((r) => r.data)
  },

  getPost(id: string): Promise<PostDetailDto> {
    return api.get<PostDetailDto>(`/posts/${id}`).then((r) => r.data)
  },

  createPost(formData: FormData): Promise<PostDetailDto> {
    return api
      .post<PostDetailDto>('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  likePost(id: string): Promise<void> {
    return api.post(`/posts/${id}/likes`).then(() => undefined)
  },

  unlikePost(id: string): Promise<void> {
    return api.delete(`/posts/${id}/likes`).then(() => undefined)
  },

  createComment(
    id: string,
    payload: { content: string; parentId?: string },
  ): Promise<CommentDto> {
    return api
      .post<CommentDto>(`/posts/${id}/comments`, payload)
      .then((r) => r.data)
  },

  getTags(): Promise<PostTag[]> {
    return api.get<PostTag[]>('/tags').then((r) => r.data)
  },
}

export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  const base = (import.meta.env.VITE_API_URL as string).replace(/\/v1\/?$/, '')
  return base + path
}
