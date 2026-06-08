import { useState } from 'react'
import { FormField } from '../molecules/FormField'
import { Divider } from '../molecules/Divider'
import { SocialLogins } from '../molecules/SocialLogins'
import { Checkbox } from '../atoms/Checkbox'
import { TextLink } from '../atoms/TextLink'
import { Button } from '../atoms/Button'

interface RegisterFormValues {
  name: string
  email: string
  password: string
  remember: boolean
}

interface RegisterFormProps {
  onSubmit?: (values: RegisterFormValues) => void
  onGithubClick?: () => void
  onGmailClick?: () => void
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(name: string, email: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (!name.trim()) errors.name = 'Informe o nome completo'
  if (!email.trim()) errors.email = 'Informe o email'
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'Informe um email válido'
  const trimmedPw = password.trim()
  if (!trimmedPw) errors.password = 'Informe a senha'
  else if (trimmedPw.length < 6) errors.password = 'A senha deve ter ao menos 6 caracteres'
  return errors
}

export function RegisterForm({ onSubmit, onGithubClick, onGmailClick }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(name, email, password)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    onSubmit?.({ name: name.trim(), email: email.trim(), password: password.trim(), remember })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        id="name"
        label="Nome"
        type="text"
        placeholder="Nome completo"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
        }}
        error={errors.name}
        autoComplete="name"
      />
      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="Digite seu email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
        }}
        error={errors.email}
        autoComplete="email"
      />
      <FormField
        id="password"
        label="Senha"
        type="password"
        placeholder="••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
        }}
        error={errors.password}
        autoComplete="new-password"
      />

      <Checkbox
        id="remember"
        label="Lembrar-me"
        checked={remember}
        onChange={setRemember}
      />

      <Button type="submit">
        Cadastrar <span aria-hidden="true">→</span>
      </Button>

      <Divider label="ou entre com outras contas" />

      <SocialLogins onGithubClick={onGithubClick} onGmailClick={onGmailClick} />

      <p className="text-center text-sm text-text-muted mt-2">
        Já tem conta?{' '}
        <TextLink to="/login" className="font-semibold">
          Faça seu login! →
        </TextLink>
      </p>
    </form>
  )
}
