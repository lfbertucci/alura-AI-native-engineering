import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PostDetailPage } from './PostDetailPage'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, isLoading: false, logout: vi.fn() }),
}))

vi.mock('../../services/post.service', () => ({
  postService: {
    getPost: () =>
      Promise.resolve({
        id: '1',
        title: 'Hooks customizados',
        description: 'Aprenda',
        code: null,
        thumbnailUrl: null,
        tags: [],
        author: { id: 'u1', name: 'Julio', handle: '@julio' },
        counts: { likes: 0, comments: 0 },
        likedByMe: false,
        createdAt: '2024-01-01T00:00:00Z',
        comments: [],
      }),
    likePost: vi.fn(),
    unlikePost: vi.fn(),
    createComment: vi.fn(),
  },
  assetUrl: (p: string | null) => p,
}))

describe('PostDetailPage', () => {
  it('renders post title after load', async () => {
    render(
      <MemoryRouter initialEntries={['/posts/1']}>
        <Routes>
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: 'Hooks customizados' })).toBeInTheDocument()
  })
})
