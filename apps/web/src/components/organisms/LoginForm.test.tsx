import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { LoginForm } from './LoginForm'

function renderForm(onSubmit = vi.fn()) {
  return render(
    <MemoryRouter>
      <LoginForm onSubmit={onSubmit} />
    </MemoryRouter>
  )
}

describe('LoginForm', () => {
  it('renders all form fields', () => {
    renderForm()
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByText('Lembrar-me')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(screen.getByText('Informe o email ou usuário')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha')).toBeInTheDocument()
  })

  it('shows password length error when too short', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('Email ou usuário'), 'user')
    await userEvent.type(screen.getByLabelText('Senha'), '123')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
    expect(screen.getByText('A senha deve ter ao menos 6 caracteres')).toBeInTheDocument()
  })

  it('calls onSubmit with field values when valid', async () => {
    const onSubmit = vi.fn()
    renderForm(onSubmit)
    await userEvent.type(screen.getByLabelText('Email ou usuário'), 'user@test.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      identifier: 'user@test.com',
      password: 'senha123',
      remember: false,
    })
  })

  it('includes remember value in onSubmit', async () => {
    const onSubmit = vi.fn()
    renderForm(onSubmit)
    await userEvent.type(screen.getByLabelText('Email ou usuário'), 'user@test.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123')
    await userEvent.click(screen.getByText('Lembrar-me'))
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ remember: true }))
  })

  it('shows serverError message when provided', () => {
    render(
      <MemoryRouter>
        <LoginForm serverError="Credenciais inválidas" />
      </MemoryRouter>
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciais inválidas')
  })

  it('disables the submit button when loading', () => {
    render(
      <MemoryRouter>
        <LoginForm loading />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
  })
})

describe('LoginForm — acessibilidade (WCAG 2 AA)', () => {
  it('não deve ter violações no estado inicial', async () => {
    const { container } = renderForm()
    const results = await axe(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    })
    expect(results).toHaveNoViolations()
  })

  it('não deve ter violações com erros de validação visíveis', async () => {
    const { container } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
    const results = await axe(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    })
    expect(results).toHaveNoViolations()
  })
})
