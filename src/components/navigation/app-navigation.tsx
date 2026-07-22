import {
  ChevronRight,
} from "lucide-react"
import {
  NavLink,
} from "react-router-dom"

import { navigationItems } from "@/components/navigation/navigation-items"
import type { AppRole } from "@/features/auth/types/auth.types"

interface AppNavigationProps {
  role: AppRole
  onNavigate?: () => void
}

const navigationDescriptions: Record<
  string,
  string
> = {
  Dashboard: "Daily office overview",
  Clients: "Client records and profiles",
  Returns: "Tax return workflow",
  "Tax Returns": "Tax return workflow",
  Reports: "Business insights and exports",
  Notifications: "Alerts and reminders",
  Staff: "Team access and workload",
  Administration: "Office settings and controls",
  "Walk-In Intake": "New client intake",
}

function getNavigationDescription(
  label: string,
): string {
  return (
    navigationDescriptions[label] ??
    "Open this workspace"
  )
}

function getNavigationClassName({
  isActive,
}: {
  isActive: boolean
}) {
  const baseClasses = [
    "group relative flex min-h-16 items-center gap-3",
    "rounded-xl border px-3.5 py-3",
    "transition-all duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-white/80",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-sidebar",
  ].join(" ")

  if (isActive) {
    return [
      baseClasses,
      "border-white/15 bg-white text-brand-950",
      "shadow-[0_8px_20px_rgb(0_0_0_/_0.16)]",
    ].join(" ")
  }

  return [
    baseClasses,
    "border-transparent text-white/80",
    "hover:border-white/10 hover:bg-white/[0.08]",
    "hover:text-white",
  ].join(" ")
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
      className="space-y-1.5"
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
            {({ isActive }) => (
              <>
                <div
                  className={[
                    "flex size-10 shrink-0 items-center justify-center",
                    "rounded-xl border transition-colors",
                    isActive
                      ? "border-brand-200 bg-brand-100 text-brand-900"
                      : "border-white/10 bg-white/[0.07] text-white/85 group-hover:bg-white/10",
                  ].join(" ")}
                >
                  <Icon
                    className="size-5"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className={[
                      "block truncate text-sm font-semibold",
                      isActive
                        ? "text-brand-950"
                        : "text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>

                  <span
                    className={[
                      "mt-0.5 block truncate text-xs",
                      isActive
                        ? "text-brand-600"
                        : "text-white/50 group-hover:text-white/65",
                    ].join(" ")}
                  >
                    {getNavigationDescription(
                      item.label,
                    )}
                  </span>
                </div>

                <ChevronRight
                  className={[
                    "size-4 shrink-0 transition-transform",
                    isActive
                      ? "translate-x-0 text-brand-500"
                      : "-translate-x-1 text-white/25 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                  ].join(" ")}
                  aria-hidden="true"
                />
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
