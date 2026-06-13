import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PostList } from './PostList'

const posts = [
  {
    id: '1',
    title: 'Post 1',
    description: 'Desc',
    thumbnailUrl: null,
    tags: [],
    author: { id: 'u1', name: 'Julio', handle: '@julio' },
    counts: { likes: 0, comments: 0 },
    likedByMe: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
]

describe('PostList', () => {
  it('renders posts', () => {
    render(
      <MemoryRouter>
        <PostList posts={posts} isAuthenticated={false} onLike={() => {}} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /Post 1/ })).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(
      <MemoryRouter>
        <PostList posts={[]} isAuthenticated={false} onLike={() => {}} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Nenhum post encontrado.')).toBeInTheDocument()
  })
})
