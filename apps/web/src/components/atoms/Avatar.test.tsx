import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders initials when no src', () => {
    render(<Avatar name="Julio Carvalho" />)
    expect(screen.getByText('JC')).toBeInTheDocument()
  })

  it('renders img when src provided', () => {
    render(<Avatar name="Julio" src="https://example.com/pic.jpg" />)
    const img = screen.getByRole('img', { name: 'Julio' })
    expect(img).toHaveAttribute('src', 'https://example.com/pic.jpg')
  })

  it('applies size class', () => {
    render(<Avatar name="Alice Brown" size="lg" />)
    const el = screen.getByText('AB')
    expect(el.className).toContain('w-12')
  })
})
