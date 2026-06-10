import { describe, expect, it, vi, beforeEach } from 'vitest'
import { authService, extractApiError } from './auth.service'

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { api } from './api'

const mockPost = vi.mocked(api.post)
const mockGet = vi.mocked(api.get)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('authService.register', () => {
  it('posts to /users and returns user data', async () => {
    const user = { id: '1', name: 'João', email: 'joao@test.com' }
    mockPost.mockResolvedValueOnce({ data: user })

    const result = await authService.register({ name: 'João', email: 'joao@test.com', password: 'senha123' })

    expect(mockPost).toHaveBeenCalledWith('/users', { name: 'João', email: 'joao@test.com', password: 'senha123' })
    expect(result).toEqual(user)
  })
})

describe('authService.login', () => {
  it('posts to /auth/login and returns accessToken', async () => {
    mockPost.mockResolvedValueOnce({ data: { accessToken: 'jwt-token' } })

    const result = await authService.login({ email: 'joao@test.com', password: 'senha123' })

    expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'joao@test.com', password: 'senha123' })
    expect(result).toEqual({ accessToken: 'jwt-token' })
  })
})

describe('authService.getMe', () => {
  it('gets /auth/me and returns user data', async () => {
    const user = { id: '1', name: 'João', email: 'joao@test.com' }
    mockGet.mockResolvedValueOnce({ data: user })

    const result = await authService.getMe()

    expect(mockGet).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(user)
  })
})

describe('extractApiError', () => {
  it('extracts string message from response', () => {
    const err = { response: { data: { message: 'Invalid credentials', statusCode: 401 } } }
    expect(extractApiError(err)).toBe('Invalid credentials')
  })

  it('extracts first message when response contains array', () => {
    const err = { response: { data: { message: ['email must be an email', 'password is required'], statusCode: 400 } } }
    expect(extractApiError(err)).toBe('email must be an email')
  })

  it('returns fallback for unknown error shape', () => {
    expect(extractApiError(new Error('network error'))).toBe('Ocorreu um erro inesperado.')
  })
})
