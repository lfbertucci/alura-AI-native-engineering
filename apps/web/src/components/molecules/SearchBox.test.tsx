import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBox } from './SearchBox'

describe('SearchBox', () => {
  it('renders with placeholder', () => {
    render(<SearchBox value="" onChange={() => {}} placeholder="Buscar" />)
    expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument()
  })

  it('calls onChange on input', async () => {
    const handler = vi.fn()
    render(<SearchBox value="" onChange={handler} />)
    await userEvent.type(screen.getByRole('searchbox'), 'react')
    expect(handler).toHaveBeenCalled()
  })

  it('shows clear button when value is set', async () => {
    const handler = vi.fn()
    render(<SearchBox value="react" onChange={handler} />)
    await userEvent.click(screen.getByLabelText('Limpar busca'))
    expect(handler).toHaveBeenCalledWith('')
  })
})
