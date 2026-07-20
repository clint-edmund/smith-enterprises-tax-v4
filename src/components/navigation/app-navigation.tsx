import {
  NavLink,
} from "react-router-dom"

import { navigationItems } from "@/components/navigation/navigation-items"
import type { AppRole } from "@/features/auth/types/auth.types"

interface AppNavigationProps {
  role: AppRole
  onNavigate?: () => void
}

function getNavigationClassName({
  isActive,
}: {
  isActive: boolean
}) {
  const baseClasses =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"

  if (isActive) {
    return `${baseClasses} bg-blue-700 text-white shadow-sm`
  }

  return `${baseClasses} text-slate-700 hover:bg-slate-100 hover:text-slate-950`
}

export function AppNavigation({
  role,
  onNavigate,
}: AppNavigationProps) {
  const visibleItems =
    navigationItems.filter((item) => {
      if (!item.allowedRoles) {
        return true
      }

      return item.allowedRoles.includes(role)
    })

  return (
    <nav
      aria-label="Primary navigation"
      className="space-y-1"
    >
      {visibleItems.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={getNavigationClassName}
          >
            <Icon
              className="size-5 shrink-0"
              aria-hidden="true"
            />

            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}