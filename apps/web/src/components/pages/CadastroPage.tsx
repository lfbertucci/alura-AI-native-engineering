import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthTemplate } from '../templates/AuthTemplate'
import { RegisterForm } from '../organisms/RegisterForm'
import { authService, extractApiError } from '../../services/auth.service'

export function CadastroPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | undefined>()

  async function handleSubmit({
    name,
    email,
    password,
  }: {
    name: string
    email: string
    password: string
    remember: boolean
  }) {
    setLoading(true)
    setServerError(undefined)
    try {
      await authService.register({ name, email, password })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setServerError(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthTemplate
      bannerSrc="/banner-cadastro.webp"
      bannerWidth={700}
      bannerHeight={467}
      bannerAlt="Mulher de óculos observando telas de código verde"
      title="Cadastro"
      subtitle="Olá! Preencha seus dados."
    >
      <RegisterForm onSubmit={handleSubmit} loading={loading} serverError={serverError} />
    </AuthTemplate>
  )
}
