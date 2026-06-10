import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('../../services/token-storage', () => ({
  getToken: vi.fn(),
}))

import { getToken } from '../../services/token-storage'

const mockGetToken = vi.mocked(getToken)

beforeEach(() => {
  vi.clearAllMocks()
})

function renderWithRoutes(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<div>Home Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('redirects to /login when no token is present', () => {
    mockGetToken.mockReturnValue(null)
    renderWithRoutes('/home')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Home Page')).not.toBeInTheDocument()
  })

  it('renders the protected child when token is present', () => {
    mockGetToken.mockReturnValue('valid-token')
    renderWithRoutes('/home')
    expect(screen.getByText('Home Page')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})
