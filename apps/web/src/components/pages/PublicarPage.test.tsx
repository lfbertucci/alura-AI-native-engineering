import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PublicarPage } from './PublicarPage'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: true, isLoading: false, logout: vi.fn() }),
}))

vi.mock('../../services/post.service', () => ({
  postService: {
    getTags: () => Promise.resolve([{ id: '1', name: 'React' }]),
    createPost: vi.fn(),
  },
  assetUrl: (p: string | null) => p,
}))

describe('PublicarPage', () => {
  it('renders page heading', async () => {
    render(
      <MemoryRouter>
        <PublicarPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Novo projeto')).toBeInTheDocument()
  })
})
