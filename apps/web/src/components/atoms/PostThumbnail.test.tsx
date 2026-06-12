import { render, screen, fireEvent } from '@testing-library/react'
import { PostThumbnail } from './PostThumbnail'

describe('PostThumbnail', () => {
  it('renders img when src provided', () => {
    render(<PostThumbnail src="https://example.com/img.jpg" title="My Post" />)
    expect(screen.getByRole('img', { name: 'My Post' })).toBeInTheDocument()
  })

  it('renders placeholder when src is null', () => {
    render(<PostThumbnail src={null} title="My Post" />)
    expect(screen.getByLabelText('Thumbnail de My Post')).toBeInTheDocument()
  })

  it('shows placeholder on image error', () => {
    render(<PostThumbnail src="https://example.com/bad.jpg" title="My Post" />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByLabelText('Thumbnail de My Post')).toBeInTheDocument()
  })
})
