interface AvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizes[size]

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <span
      aria-label={name}
      className={`${sizeClass} rounded-full bg-accent text-text-on-dark flex items-center justify-center font-semibold shrink-0 ${className}`}
    >
      {initials(name)}
    </span>
  )
}
