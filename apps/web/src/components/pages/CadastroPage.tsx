import { AuthTemplate } from '../templates/AuthTemplate'
import { RegisterForm } from '../organisms/RegisterForm'

export function CadastroPage() {
  return (
    <AuthTemplate
      bannerSrc="/banner-cadastro.webp"
      bannerWidth={700}
      bannerHeight={467}
      bannerAlt="Mulher de óculos observando telas de código verde"
      title="Cadastro"
      subtitle="Olá! Preencha seus dados."
    >
      <RegisterForm onSubmit={() => console.log('TODO: connect auth API')} />
    </AuthTemplate>
  )
}
