interface AuthTemplateProps {
  bannerSrc: string
  bannerAlt: string
  bannerWidth?: number
  bannerHeight?: number
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthTemplate({ bannerSrc, bannerAlt, bannerWidth, bannerHeight, title, subtitle, children }: AuthTemplateProps) {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Banner */}
        <div className="md:w-[45%] flex-shrink-0">
          <img
            src={bannerSrc}
            alt={bannerAlt}
            width={bannerWidth}
            height={bannerHeight}
            fetchPriority="high"
            decoding="async"
            className="w-full h-48 md:h-full object-cover object-center"
          />
        </div>

        {/* Form column */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 md:px-10">
          <h1 className="text-2xl font-bold text-text mb-1">{title}</h1>
          {subtitle && (
            <p className="text-sm text-text-muted mb-6">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </main>
  )
}
