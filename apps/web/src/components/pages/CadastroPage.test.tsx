import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { CadastroPage } from './CadastroPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <CadastroPage />
    </MemoryRouter>
  )
}

describe('CadastroPage', () => {
  it('renders the cadastro banner', () => {
    renderPage()
    expect(screen.getByAltText(/mulher de óculos/i)).toBeInTheDocument()
  })

  it('renders the cadastro title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    renderPage()
    expect(screen.getByText('Olá! Preencha seus dados.')).toBeInTheDocument()
  })

  it('renders the register form fields', () => {
    renderPage()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })
})

describe('CadastroPage — acessibilidade (WCAG 2 AA)', () => {
  it('não deve ter violações', async () => {
    const { container } = renderPage()
    const results = await axe(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    })
    expect(results).toHaveNoViolations()
  })
})
