import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders label', () => {
    render(<Button>Login</Button>)
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('fires onClick', async () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Click me</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is set', async () => {
    const handler = vi.fn()
    render(<Button disabled onClick={handler}>Submit</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(handler).not.toHaveBeenCalled()
  })
})
