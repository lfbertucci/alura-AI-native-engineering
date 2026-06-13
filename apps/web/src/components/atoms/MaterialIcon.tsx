interface MaterialIconProps {
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' }

export function MaterialIcon({ name, className = '', size = 'md' }: MaterialIconProps) {
  return (
    <span
      className={`material-icons select-none ${sizeClass[size]} ${className}`}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
