import { render, screen } from '@testing-library/react'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders banner with alt text', () => {
    render(
      <AuthTemplate bannerSrc="/banner-login.png" bannerAlt="Banner de login" title="Login">
        <p>Form slot</p>
      </AuthTemplate>
    )
    expect(screen.getByAltText('Banner de login')).toBeInTheDocument()
  })

  it('renders title and subtitle', () => {
    render(
      <AuthTemplate
        bannerSrc="/banner-login.png"
        bannerAlt="Banner"
        title="Login"
        subtitle="Boas-vindas! Faça seu login."
      >
        <p>Form slot</p>
      </AuthTemplate>
    )
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByText('Boas-vindas! Faça seu login.')).toBeInTheDocument()
  })

  it('renders children in the form slot', () => {
    render(
      <AuthTemplate bannerSrc="/banner-login.png" bannerAlt="Banner" title="Login">
        <p>Conteúdo do formulário</p>
      </AuthTemplate>
    )
    expect(screen.getByText('Conteúdo do formulário')).toBeInTheDocument()
  })

  it('omits subtitle when not provided', () => {
    render(
      <AuthTemplate bannerSrc="/banner-login.png" bannerAlt="Banner" title="Login">
        <p>Form</p>
      </AuthTemplate>
    )
    expect(screen.queryByText('Boas-vindas')).not.toBeInTheDocument()
  })
})
