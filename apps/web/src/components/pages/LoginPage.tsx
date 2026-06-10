import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthTemplate } from '../templates/AuthTemplate'
import { LoginForm } from '../organisms/LoginForm'
import { authService, extractApiError } from '../../services/auth.service'
import { setToken } from '../../services/token-storage'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()

  const registered = (location.state as { registered?: boolean } | null)?.registered

  async function handleSubmit({
    identifier,
    password,
    remember,
  }: {
    identifier: string
    password: string
    remember: boolean
  }) {
    setLoading(true)
    setServerError(undefined)
    try {
      const { accessToken } = await authService.login({ email: identifier, password })
      setToken(accessToken, remember)
      navigate('/home')
    } catch (err) {
      setServerError(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthTemplate
      bannerSrc="/banner-login.webp"
      bannerWidth={700}
      bannerHeight={1094}
      bannerAlt="Mulher sorrindo em ambiente tecnológico com código connect"
      title="Login"
      subtitle="Boas-vindas! Faça seu login."
    >
      {registered && (
        <p role="status" className="text-sm text-accent text-center mb-2">
          Cadastro realizado! Faça seu login.
        </p>
      )}
      <LoginForm onSubmit={handleSubmit} loading={loading} serverError={serverError} />
    </AuthTemplate>
  )
}
