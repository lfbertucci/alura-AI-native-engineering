import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders label text', () => {
    render(<Checkbox id="remember" label="Lembrar-me" checked={false} onChange={() => {}} />)
    expect(screen.getByText('Lembrar-me')).toBeInTheDocument()
  })

  it('reflects checked state', () => {
    render(<Checkbox id="remember" label="Lembrar-me" checked={true} onChange={() => {}} />)
    expect(screen.getByRole('checkbox', { hidden: true })).toBeChecked()
  })

  it('fires onChange when clicked', async () => {
    const handler = vi.fn()
    render(<Checkbox id="remember" label="Lembrar-me" checked={false} onChange={handler} />)
    await userEvent.click(screen.getByText('Lembrar-me'))
    expect(handler).toHaveBeenCalledWith(true)
  })
})
