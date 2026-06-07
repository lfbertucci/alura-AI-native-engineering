import { AuthTemplate } from '../templates/AuthTemplate'
import { LoginForm } from '../organisms/LoginForm'

export function LoginPage() {
  return (
    <AuthTemplate
      bannerSrc="/banner-login.png"
      bannerAlt="Mulher sorrindo em ambiente tecnológico com código connect"
      title="Login"
      subtitle="Boas-vindas! Faça seu login."
    >
      <LoginForm onSubmit={(values) => console.log('TODO: auth API', values)} />
    </AuthTemplate>
  )
}
