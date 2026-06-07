import { render, screen } from '@testing-library/react'
import { Label } from './Label'

describe('Label', () => {
  it('renders children', () => {
    render(<Label>Email ou usuário</Label>)
    expect(screen.getByText('Email ou usuário')).toBeInTheDocument()
  })

  it('applies htmlFor', () => {
    render(<Label htmlFor="email-input">Email</Label>)
    expect(screen.getByText('Email').closest('label')).toHaveAttribute('for', 'email-input')
  })
})
