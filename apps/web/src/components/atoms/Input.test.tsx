import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="usuario123" />)
    expect(screen.getByPlaceholderText('usuario123')).toBeInTheDocument()
  })

  it('reflects controlled value', () => {
    render(<Input value="test@email.com" onChange={() => {}} />)
    expect(screen.getByDisplayValue('test@email.com')).toBeInTheDocument()
  })

  it('fires onChange handler', async () => {
    const handler = vi.fn()
    render(<Input onChange={handler} />)
    await userEvent.type(screen.getByRole('textbox'), 'a')
    expect(handler).toHaveBeenCalled()
  })

  it('sets aria-invalid when hasError is true', () => {
    render(<Input hasError />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })
})
