import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  it('renders the login banner', () => {
    renderPage()
    expect(screen.getByAltText(/mulher sorrindo/i)).toBeInTheDocument()
  })

  it('renders the login title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    renderPage()
    expect(screen.getByText('Boas-vindas! Faça seu login.')).toBeInTheDocument()
  })

  it('renders the login form', () => {
    renderPage()
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })
})
