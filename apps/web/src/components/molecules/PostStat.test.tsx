import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostStat } from './PostStat'

describe('PostStat', () => {
  it('renders count', () => {
    render(<PostStat icon="favorite" count={42} label="Curtidas" />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('calls onClick when provided', async () => {
    const handler = vi.fn()
    render(<PostStat icon="favorite" count={1} label="Curtir" onClick={handler} />)
    await userEvent.click(screen.getByLabelText('Curtir'))
    expect(handler).toHaveBeenCalled()
  })
})
