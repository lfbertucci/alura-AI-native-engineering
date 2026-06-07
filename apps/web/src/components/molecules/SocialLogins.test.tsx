import { render, screen } from '@testing-library/react'
import { SocialLogins } from './SocialLogins'

describe('SocialLogins', () => {
  it('renders GitHub and Gmail buttons', () => {
    render(<SocialLogins />)
    expect(screen.getByAltText('Logo do GitHub')).toBeInTheDocument()
    expect(screen.getByAltText('Logo do Gmail')).toBeInTheDocument()
  })

  it('renders both labels', () => {
    render(<SocialLogins />)
    expect(screen.getByText('Github')).toBeInTheDocument()
    expect(screen.getByText('Gmail')).toBeInTheDocument()
  })
})
