interface SocialButtonProps {
  src: string
  alt: string
  label: string
  onClick?: () => void
}

export function SocialButton({ src, alt, label, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 px-6 py-2 rounded-lg hover:bg-[var(--color-surface-input)] transition-colors cursor-pointer"
    >
      <img src={src} alt={alt} className="w-8 h-8 object-contain" />
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
    </button>
  )
}
