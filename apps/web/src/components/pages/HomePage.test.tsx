import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { HomePage } from './HomePage'

vi.mock('../../services/auth.service', () => ({
  authService: { getMe: vi.fn() },
}))

vi.mock('../../services/token-storage', () => ({
  clearToken: vi.fn(),
}))

import { authService } from '../../services/auth.service'
import { clearToken } from '../../services/token-storage'

const mockGetMe = vi.mocked(authService.getMe)
const mockClearToken = vi.mocked(clearToken)

beforeEach(() => {
  vi.clearAllMocks()
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('HomePage', () => {
  it('shows loading text while fetching user', () => {
    mockGetMe.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('displays user name after getMe resolves', async () => {
    mockGetMe.mockResolvedValueOnce({ id: '1', name: 'João Silva', email: 'joao@test.com' })
    renderPage()
    await waitFor(() => expect(screen.getByText('Olá, João Silva!')).toBeInTheDocument())
  })

  it('redirects to /login when getMe fails', async () => {
    mockGetMe.mockRejectedValueOnce(new Error('Unauthorized'))
    renderPage()
    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
    expect(mockClearToken).toHaveBeenCalled()
  })

  it('calls clearToken and navigates to /login on logout', async () => {
    mockGetMe.mockResolvedValueOnce({ id: '1', name: 'João Silva', email: 'joao@test.com' })
    renderPage()
    await waitFor(() => screen.getByText('Olá, João Silva!'))
    await userEvent.click(screen.getByRole('button', { name: /sair/i }))
    expect(mockClearToken).toHaveBeenCalled()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
