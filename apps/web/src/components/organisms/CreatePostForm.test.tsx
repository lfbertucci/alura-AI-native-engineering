import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreatePostForm } from './CreatePostForm'

const tags = [
  { id: '1', name: 'React' },
  { id: '2', name: 'CSS' },
]

describe('CreatePostForm', () => {
  it('renders required fields', () => {
    render(<CreatePostForm availableTags={tags} onSubmit={vi.fn()} onDiscard={vi.fn()} />)
    expect(screen.getByLabelText('Título *')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição *')).toBeInTheDocument()
  })

  it('shows error when submitting empty title', async () => {
    render(<CreatePostForm availableTags={tags} onSubmit={vi.fn()} onDiscard={vi.fn()} />)
    await userEvent.click(screen.getByText('Publicar'))
    expect(screen.getByRole('alert')).toHaveTextContent('Título e descrição são obrigatórios.')
  })

  it('calls onDiscard when discard button clicked', async () => {
    const onDiscard = vi.fn()
    render(<CreatePostForm availableTags={tags} onSubmit={vi.fn()} onDiscard={onDiscard} />)
    await userEvent.click(screen.getByText('Descartar'))
    expect(onDiscard).toHaveBeenCalled()
  })

  it('renders available tags', () => {
    render(<CreatePostForm availableTags={tags} onSubmit={vi.fn()} onDiscard={vi.fn()} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('CSS')).toBeInTheDocument()
  })
})
