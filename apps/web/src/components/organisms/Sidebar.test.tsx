import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

const unauthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  logout: vi.fn(),
}

const authState = {
  user: { id: 'u1', name: 'Julio', email: 'julio@test.com' },
  isAuthenticated: true,
  isLoading: false,
  logout: vi.fn(),
}

describe('Sidebar', () => {
  it('shows Login link when unauthenticated', () => {
    render(
      <MemoryRouter>
        <Sidebar auth={unauthState} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Login/ })).toBeInTheDocument()
  })

  it('shows Sair button when authenticated', () => {
    render(
      <MemoryRouter>
        <Sidebar auth={authState} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /Sair/ })).toBeInTheDocument()
  })

  it('shows Publicar link when authenticated', () => {
    render(
      <MemoryRouter>
        <Sidebar auth={authState} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Publicar/ })).toBeInTheDocument()
  })
})
