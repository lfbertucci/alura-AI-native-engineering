import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { AuthTemplate } from './AuthTemplate'

describe('AuthTemplate', () => {
  it('renders banner with alt text', () => {
    render(
      <AuthTemplate bannerSrc="/banner-login.webp" bannerAlt="Banner de login" title="Login">
        <p>Form slot</p>
      </AuthTemplate>
    )
    expect(screen.getByAltText('Banner de login')).toBeInTheDocument()
  })

  it('renders title and subtitle', () => {
    render(
      <AuthTemplate
        bannerSrc="/banner-login.webp"
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
      <AuthTemplate bannerSrc="/banner-login.webp" bannerAlt="Banner" title="Login">
        <p>Conteúdo do formulário</p>
      </AuthTemplate>
    )
    expect(screen.getByText('Conteúdo do formulário')).toBeInTheDocument()
  })

  it('omits subtitle when not provided', () => {
    render(
      <AuthTemplate bannerSrc="/banner-login.webp" bannerAlt="Banner" title="Login">
        <p>Form</p>
      </AuthTemplate>
    )
    expect(screen.queryByText('Boas-vindas')).not.toBeInTheDocument()
  })

  it('has a main landmark', () => {
    render(
      <AuthTemplate bannerSrc="/banner-login.webp" bannerAlt="Banner" title="Login">
        <p>Form</p>
      </AuthTemplate>
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})

describe('AuthTemplate — acessibilidade (WCAG 2 AA)', () => {
  it('não deve ter violações', async () => {
    const { container } = render(
      <AuthTemplate
        bannerSrc="/banner-login.webp"
        bannerAlt="Banner de autenticação"
        title="Login"
        subtitle="Boas-vindas! Faça seu login."
      >
        <p>Conteúdo do formulário</p>
      </AuthTemplate>
    )
    const results = await axe(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    })
    expect(results).toHaveNoViolations()
  })
})
