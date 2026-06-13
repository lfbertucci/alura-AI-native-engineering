import { Link } from 'react-router-dom'
import { NavItem } from '../molecules/NavItem'
import { MaterialIcon } from '../atoms/MaterialIcon'
import type { AuthState } from '../../hooks/useAuth'

interface SidebarProps {
  auth: AuthState
}

export function Sidebar({ auth }: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 bg-bg border-r border-border px-4 py-6">
      <Link to="/feed" className="flex items-center gap-2 mb-8 px-4">
        <span className="text-xl font-bold text-accent">{'</>'}</span>
        <span className="text-lg font-bold text-text">CodeConnect</span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        <NavItem to="/feed" icon="home" label="Feed" />
        <NavItem to="/perfil" icon="person" label="Perfil" />
        <NavItem to="/sobre" icon="info" label="Sobre nós" />
      </nav>

      {auth.isAuthenticated && (
        <Link
          to="/publicar"
          className="flex items-center justify-center gap-2 py-2 mb-4 bg-accent text-text-on-dark rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors"
        >
          <MaterialIcon name="add" size="sm" />
          Publicar
        </Link>
      )}

      <div className="border-t border-border pt-4">
        {auth.isAuthenticated ? (
          <button
            onClick={auth.logout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <MaterialIcon name="logout" size="sm" />
            Sair
          </button>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <MaterialIcon name="login" size="sm" />
            Login
          </Link>
        )}
      </div>
    </aside>
  )
}
