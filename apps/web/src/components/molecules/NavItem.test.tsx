import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NavItem } from './NavItem'

describe('NavItem', () => {
  it('renders label', () => {
    render(
      <MemoryRouter>
        <NavItem to="/feed" icon="home" label="Feed" />
      </MemoryRouter>,
    )
    expect(screen.getByText('Feed')).toBeInTheDocument()
  })

  it('applies active styles when route matches', () => {
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <NavItem to="/feed" icon="home" label="Feed" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Feed/ }).className).toContain('text-accent')
  })
})
