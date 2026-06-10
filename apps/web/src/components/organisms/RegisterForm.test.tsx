import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { RegisterForm } from './RegisterForm'

function renderForm(onSubmit = vi.fn()) {
  return render(
    <MemoryRouter>
      <RegisterForm onSubmit={onSubmit} />
    </MemoryRouter>
  )
}

describe('RegisterForm', () => {
  it('renders all form fields', () => {
    renderForm()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByText('Lembrar-me')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))
    expect(screen.getAllByRole('alert')).toHaveLength(3)
    expect(screen.getByText('Informe o nome completo')).toBeInTheDocument()
    expect(screen.getByText('Informe o email')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha')).toBeInTheDocument()
  })

  it('shows invalid email error', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('Nome'), 'João Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'nao-e-email')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123')
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))
    expect(screen.getByText('Informe um email válido')).toBeInTheDocument()
  })

  it('shows password length error when too short', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('Nome'), 'João Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'joao@test.com')
    await userEvent.type(screen.getByLabelText('Senha'), '123')
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))
    expect(screen.getByText('A senha deve ter ao menos 6 caracteres')).toBeInTheDocument()
  })

  it('calls onSubmit with field values when valid', async () => {
    const onSubmit = vi.fn()
    renderForm(onSubmit)
    await userEvent.type(screen.getByLabelText('Nome'), 'João Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'joao@test.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123')
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'João Silva',
      email: 'joao@test.com',
      password: 'senha123',
      remember: false,
    })
  })

  it('includes remember value in onSubmit', async () => {
    const onSubmit = vi.fn()
    renderForm(onSubmit)
    await userEvent.type(screen.getByLabelText('Nome'), 'João Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'joao@test.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123')
    await userEvent.click(screen.getByText('Lembrar-me'))
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ remember: true }))
  })

  it('shows serverError message when provided', () => {
    render(
      <MemoryRouter>
        <RegisterForm serverError="Email já em uso" />
      </MemoryRouter>
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Email já em uso')
  })

  it('disables the submit button when loading', () => {
    render(
      <MemoryRouter>
        <RegisterForm loading />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: /cadastrando/i })).toBeDisabled()
  })
})

describe('RegisterForm — acessibilidade (WCAG 2 AA)', () => {
  it('não deve ter violações no estado inicial', async () => {
    const { container } = renderForm()
    const results = await axe(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    })
    expect(results).toHaveNoViolations()
  })

  it('não deve ter violações com erros de validação visíveis', async () => {
    const { container } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))
    const results = await axe(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    })
    expect(results).toHaveNoViolations()
  })
})
