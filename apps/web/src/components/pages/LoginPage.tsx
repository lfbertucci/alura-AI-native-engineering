import { AuthTemplate } from '../templates/AuthTemplate'
import { LoginForm } from '../organisms/LoginForm'

export function LoginPage() {
  return (
    <AuthTemplate
      bannerSrc="/banner-login.webp"
      bannerWidth={700}
      bannerHeight={1094}
      bannerAlt="Mulher sorrindo em ambiente tecnológico com código connect"
      title="Login"
      subtitle="Boas-vindas! Faça seu login."
    >
      <LoginForm onSubmit={() => console.log('TODO: connect auth API')} />
    </AuthTemplate>
  )
}
