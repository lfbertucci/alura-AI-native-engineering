import { render, screen } from '@testing-library/react'
import { MaterialIcon } from './MaterialIcon'

describe('MaterialIcon', () => {
  it('renders icon name as text content', () => {
    render(<MaterialIcon name="favorite" />)
    expect(screen.getByText('favorite')).toBeInTheDocument()
  })

  it('is aria-hidden', () => {
    render(<MaterialIcon name="share" />)
    expect(screen.getByText('share')).toHaveAttribute('aria-hidden', 'true')
  })
})
