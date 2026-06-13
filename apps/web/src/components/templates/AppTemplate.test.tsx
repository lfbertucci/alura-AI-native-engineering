import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppTemplate } from './AppTemplate'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    logout: vi.fn(),
  }),
}))

describe('AppTemplate', () => {
  it('renders sidebar and children', () => {
    render(
      <MemoryRouter>
        <AppTemplate>
          <p>Conteúdo</p>
        </AppTemplate>
      </MemoryRouter>,
    )
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
    expect(screen.getByText('CodeConnect')).toBeInTheDocument()
  })
})
