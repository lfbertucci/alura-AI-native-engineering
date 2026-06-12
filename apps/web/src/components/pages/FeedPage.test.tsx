import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FeedPage } from './FeedPage'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, isLoading: false, logout: vi.fn() }),
}))

vi.mock('../../services/post.service', () => ({
  postService: {
    getTags: () => Promise.resolve([]),
    getPosts: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 12 }),
    likePost: vi.fn(),
    unlikePost: vi.fn(),
  },
  assetUrl: (p: string | null) => p,
}))

describe('FeedPage', () => {
  it('renders search box', async () => {
    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )
    expect(screen.getByLabelText('Buscar posts')).toBeInTheDocument()
  })
})
