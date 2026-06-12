import { useState } from 'react'
import { MaterialIcon } from './MaterialIcon'

interface PostThumbnailProps {
  src: string | null | undefined
  title: string
  className?: string
}

export function PostThumbnail({ src, title, className = '' }: PostThumbnailProps) {
  const [errored, setErrored] = useState(false)

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={title}
        onError={() => setErrored(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      aria-label={`Thumbnail de ${title}`}
      className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-placeholder-bg ${className}`}
    >
      <MaterialIcon name="image" size="lg" className="text-text-muted" />
      <span className="text-xs text-text-muted text-center px-2 line-clamp-2">{title}</span>
    </div>
  )
}
