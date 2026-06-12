import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterChips } from './FilterChips'

const tags = [
  { id: '1', name: 'React' },
  { id: '2', name: 'CSS' },
]

describe('FilterChips', () => {
  it('renders all tags', () => {
    render(<FilterChips tags={tags} selected={[]} onToggle={() => {}} onClear={() => {}} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('CSS')).toBeInTheDocument()
  })

  it('shows clear button when tags are selected', () => {
    render(
      <FilterChips tags={tags} selected={['React']} onToggle={() => {}} onClear={() => {}} />,
    )
    expect(screen.getByText('Limpar tudo')).toBeInTheDocument()
  })

  it('calls onClear', async () => {
    const onClear = vi.fn()
    render(
      <FilterChips tags={tags} selected={['React']} onToggle={() => {}} onClear={onClear} />,
    )
    await userEvent.click(screen.getByText('Limpar tudo'))
    expect(onClear).toHaveBeenCalled()
  })
})
