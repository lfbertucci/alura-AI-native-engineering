import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, type UserResponse } from '../services/auth.service'
import { getToken, clearToken } from '../services/token-storage'

export interface AuthState {
  user: UserResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    authService
      .getMe()
      .then(setUser)
      .catch(() => {
        clearToken()
        navigate('/login')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    navigate('/login')
  }, [navigate])

  return { user, isAuthenticated: user !== null, isLoading, logout }
}
