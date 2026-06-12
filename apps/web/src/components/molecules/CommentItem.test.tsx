import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentItem } from './CommentItem'

const mockComment = {
  id: '1',
  content: 'Ótimo post!',
  author: { id: 'u1', name: 'Julio', handle: '@julio' },
  createdAt: '2024-01-01T00:00:00Z',
  replies: [],
}

describe('CommentItem', () => {
  it('renders comment content', () => {
    render(<CommentItem comment={mockComment} isAuthenticated={false} />)
    expect(screen.getByText('Ótimo post!')).toBeInTheDocument()
  })

  it('shows reply button when authenticated', () => {
    render(<CommentItem comment={mockComment} isAuthenticated={true} />)
    expect(screen.getByText('Responder')).toBeInTheDocument()
  })

  it('hides reply button when not authenticated', () => {
    render(<CommentItem comment={mockComment} isAuthenticated={false} />)
    expect(screen.queryByText('Responder')).not.toBeInTheDocument()
  })

  it('shows replies toggle when replies exist', () => {
    const commentWithReplies = {
      ...mockComment,
      replies: [
        {
          id: '2',
          content: 'Concordo!',
          author: { id: 'u2', name: 'Marcia', handle: '@marcia' },
          createdAt: '2024-01-01T01:00:00Z',
          replies: [],
        },
      ],
    }
    render(<CommentItem comment={commentWithReplies} isAuthenticated={false} />)
    expect(screen.getByText('Ver 1 resposta')).toBeInTheDocument()
  })

  it('shows reply form on Responder click', async () => {
    render(<CommentItem comment={mockComment} isAuthenticated={true} onReply={vi.fn()} />)
    await userEvent.click(screen.getByText('Responder'))
    expect(screen.getByLabelText('Escrever resposta')).toBeInTheDocument()
  })
})
