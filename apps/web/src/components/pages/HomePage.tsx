import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'
import { clearToken } from '../../services/token-storage'

export function HomePage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    authService
      .getMe()
      .then((user) => setUserName(user.name))
      .catch(() => {
        navigate('/login')
      })
  }, [navigate])

  function handleLogout() {
    clearToken()
    navigate('/login')
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold text-text">
        {userName ? `Olá, ${userName}!` : 'Carregando...'}
      </h1>
      <button
        onClick={handleLogout}
        className="px-6 py-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text hover:border-accent transition-colors duration-150"
      >
        Sair
      </button>
    </main>
  )
}
