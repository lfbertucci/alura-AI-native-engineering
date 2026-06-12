import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PostCard } from './PostCard'

const mockPost = {
  id: '1',
  title: 'Hooks customizados',
  description: 'Aprenda hooks',
  thumbnailUrl: null,
  tags: [{ id: 't1', name: 'React' }],
  author: { id: 'u1', name: 'Julio', handle: '@julio' },
  counts: { likes: 5, comments: 2 },
  likedByMe: false,
  createdAt: '2024-01-01T00:00:00Z',
}

function renderCard(overrides = {}) {
  return render(
    <MemoryRouter>
      <PostCard post={{ ...mockPost, ...overrides }} onLike={vi.fn()} isAuthenticated={true} />
    </MemoryRouter>,
  )
}

describe('PostCard', () => {
  it('renders title', () => {
    renderCard()
    expect(screen.getByRole('heading', { name: /Hooks customizados/ })).toBeInTheDocument()
  })

  it('renders tag', () => {
    renderCard()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('calls onLike when authenticated', async () => {
    const onLike = vi.fn()
    render(
      <MemoryRouter>
        <PostCard post={mockPost} onLike={onLike} isAuthenticated={true} />
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByLabelText('Curtir'))
    expect(onLike).toHaveBeenCalled()
  })
})
