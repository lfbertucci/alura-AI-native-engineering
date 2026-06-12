import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PostDetailCard } from './PostDetailCard'

const mockPost = {
  id: '1',
  title: 'Hooks customizados',
  description: 'Aprenda hooks',
  code: 'const x = 1',
  thumbnailUrl: null,
  tags: [{ id: 't1', name: 'React' }],
  author: { id: 'u1', name: 'Julio', handle: '@julio' },
  counts: { likes: 5, comments: 2 },
  likedByMe: false,
  createdAt: '2024-01-01T00:00:00Z',
  comments: [],
}

describe('PostDetailCard', () => {
  it('renders title and description', () => {
    render(
      <MemoryRouter>
        <PostDetailCard post={mockPost} isAuthenticated={false} onLike={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Hooks customizados' })).toBeInTheDocument()
    expect(screen.getByText('Aprenda hooks')).toBeInTheDocument()
  })

  it('renders author name', () => {
    render(
      <MemoryRouter>
        <PostDetailCard post={mockPost} isAuthenticated={false} onLike={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Julio')).toBeInTheDocument()
  })
})
