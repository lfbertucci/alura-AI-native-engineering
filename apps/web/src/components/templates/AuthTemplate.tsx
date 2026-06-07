interface AuthTemplateProps {
  bannerSrc: string
  bannerAlt: string
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthTemplate({ bannerSrc, bannerAlt, title, subtitle, children }: AuthTemplateProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[var(--color-surface)] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Banner */}
        <div className="md:w-[45%] flex-shrink-0">
          <img
            src={bannerSrc}
            alt={bannerAlt}
            className="w-full h-48 md:h-full object-cover object-center"
          />
        </div>

        {/* Form column */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 md:px-10">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-muted)] mb-6">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
