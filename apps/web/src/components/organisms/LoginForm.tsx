import { useState } from 'react'
import { FormField } from '../molecules/FormField'
import { Divider } from '../molecules/Divider'
import { SocialLogins } from '../molecules/SocialLogins'
import { Checkbox } from '../atoms/Checkbox'
import { TextLink } from '../atoms/TextLink'
import { Button } from '../atoms/Button'

interface LoginFormValues {
  identifier: string
  password: string
  remember: boolean
}

interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => void
}

interface FormErrors {
  identifier?: string
  password?: string
}

function validate(identifier: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (!identifier.trim()) errors.identifier = 'Informe o email ou usuário'
  if (!password) errors.password = 'Informe a senha'
  else if (password.length < 6) errors.password = 'A senha deve ter ao menos 6 caracteres'
  return errors
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(identifier, password)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    onSubmit?.({ identifier, password, remember })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        id="identifier"
        label="Email ou usuário"
        type="text"
        placeholder="usuario123"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        error={errors.identifier}
        autoComplete="username"
      />
      <FormField
        id="password"
        label="Senha"
        type="password"
        placeholder="••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <Checkbox
          id="remember"
          label="Lembrar-me"
          checked={remember}
          onChange={setRemember}
        />
        <TextLink href="#">Esqueci a senha</TextLink>
      </div>

      <Button type="submit">
        Login <span aria-hidden="true">→</span>
      </Button>

      <Divider label="ou entre com outras contas" />

      <SocialLogins />

      <p className="text-center text-sm text-[var(--color-text-muted)] mt-2">
        Ainda não tem conta?{' '}
        <TextLink to="/cadastro" className="font-semibold">
          Crie seu cadastro! 📋
        </TextLink>
      </p>
    </form>
  )
}
