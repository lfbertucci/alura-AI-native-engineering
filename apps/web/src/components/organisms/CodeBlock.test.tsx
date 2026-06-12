import { render, screen } from '@testing-library/react'
import { CodeBlock } from './CodeBlock'

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock code="const x = 1" />)
    expect(screen.getByText('const x = 1')).toBeInTheDocument()
  })

  it('has accessible label', () => {
    render(<CodeBlock code="const x = 1" />)
    expect(screen.getByRole('region', { name: 'Trecho de código' })).toBeInTheDocument()
  })
})
