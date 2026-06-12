import type { ReactNode } from 'react'
import { Sidebar } from '../organisms/Sidebar'
import { useAuth } from '../../hooks/useAuth'

interface AppTemplateProps {
  children: ReactNode
}

export function AppTemplate({ children }: AppTemplateProps) {
  const auth = useAuth()

  return (
    <div className="flex min-h-screen">
      <Sidebar auth={auth} />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  )
}
