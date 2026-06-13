import { NavLink } from 'react-router-dom'
import { MaterialIcon } from '../atoms/MaterialIcon'

interface NavItemProps {
  to: string
  icon: string
  label: string
}

export function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive ? 'bg-surface text-accent' : 'text-text-muted hover:text-text hover:bg-surface'}`
      }
    >
      <MaterialIcon name={icon} size="sm" />
      <span>{label}</span>
    </NavLink>
  )
}
