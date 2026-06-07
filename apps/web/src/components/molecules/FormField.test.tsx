import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField } from './FormField'

describe('FormField', () => {
  it('renders label and input', () => {
    render(<FormField id="email" label="Email ou usuário" />)
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
  })

  it('renders error message with role=alert', () => {
    render(<FormField id="email" label="Email" error="Campo obrigatório" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obrigatório')
  })

  it('does not render error when not provided', () => {
    render(<FormField id="email" label="Email" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('fires onChange', async () => {
    const handler = vi.fn()
    render(<FormField id="email" label="Email" onChange={handler} />)
    await userEvent.type(screen.getByLabelText('Email'), 'a')
    expect(handler).toHaveBeenCalled()
  })
})
