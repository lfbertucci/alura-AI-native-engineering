import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SocialButton } from './SocialButton'

describe('SocialButton', () => {
  it('renders logo with alt text and label', () => {
    render(<SocialButton src="/github.png" alt="Logo do GitHub" label="Github" />)
    expect(screen.getByAltText('Logo do GitHub')).toBeInTheDocument()
    expect(screen.getByText('Github')).toBeInTheDocument()
  })

  it('fires onClick when clicked', async () => {
    const handler = vi.fn()
    render(<SocialButton src="/gmail.png" alt="Logo do Gmail" label="Gmail" onClick={handler} />)
    await userEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
