import type { AxiosError } from 'axios'
import { api } from './api'

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
}

export interface UserResponse {
  id: string
  name: string
  email: string
}

interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  error?: string
}

export function extractApiError(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorBody>
  const message = axiosError.response?.data?.message
  if (Array.isArray(message)) return message[0]
  if (typeof message === 'string') return message
  return 'Ocorreu um erro inesperado.'
}

export const authService = {
  register(payload: RegisterPayload): Promise<UserResponse> {
    return api.post<UserResponse>('/users', payload).then((r) => r.data)
  },

  login(payload: LoginPayload): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', payload).then((r) => r.data)
  },

  getMe(): Promise<UserResponse> {
    return api.get<UserResponse>('/auth/me').then((r) => r.data)
  },
}
