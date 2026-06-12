import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CommentsSection } from './CommentsSection'

const comments = [
  {
    id: '1',
    content: 'Ótimo post!',
    author: { id: 'u1', name: 'Julio', handle: '@julio' },
    createdAt: '2024-01-01T00:00:00Z',
    replies: [],
  },
]

describe('CommentsSection', () => {
  it('renders comments', () => {
    render(
      <MemoryRouter>
        <CommentsSection
          postId="p1"
          comments={comments}
          isAuthenticated={false}
          onAddComment={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Ótimo post!')).toBeInTheDocument()
  })

  it('shows comment form when authenticated', () => {
    render(
      <MemoryRouter>
        <CommentsSection
          postId="p1"
          comments={[]}
          isAuthenticated={true}
          onAddComment={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(screen.getByLabelText('Escrever comentário')).toBeInTheDocument()
  })

  it('shows login link when unauthenticated', () => {
    render(
      <MemoryRouter>
        <CommentsSection
          postId="p1"
          comments={[]}
          isAuthenticated={false}
          onAddComment={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Faça login' })).toBeInTheDocument()
  })
})
