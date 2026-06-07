import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TextLink } from './TextLink'

describe('TextLink', () => {
  it('renders as a router Link when "to" is provided', () => {
    render(
      <MemoryRouter>
        <TextLink to="/cadastro">Crie seu cadastro!</TextLink>
      </MemoryRouter>
    )
    const link = screen.getByRole('link', { name: 'Crie seu cadastro!' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/cadastro')
  })

  it('renders as an anchor when "href" is provided', () => {
    render(
      <MemoryRouter>
        <TextLink href="/esqueci">Esqueci a senha</TextLink>
      </MemoryRouter>
    )
    const link = screen.getByRole('link', { name: 'Esqueci a senha' })
    expect(link).toHaveAttribute('href', '/esqueci')
  })
})
