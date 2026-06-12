import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagChip } from './TagChip'

describe('TagChip', () => {
  it('renders label', () => {
    render(<TagChip label="React" />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('calls onClick', async () => {
    const handler = vi.fn()
    render(<TagChip label="React" onClick={handler} />)
    await userEvent.click(screen.getByRole('button', { name: 'React' }))
    expect(handler).toHaveBeenCalled()
  })

  it('calls onRemove', async () => {
    const handler = vi.fn()
    render(<TagChip label="React" onRemove={handler} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remover tag React' }))
    expect(handler).toHaveBeenCalled()
  })

  it('applies active styles', () => {
    render(<TagChip label="React" active />)
    expect(screen.getByRole('button', { name: /React/ }).className).toContain('bg-accent')
  })
})
