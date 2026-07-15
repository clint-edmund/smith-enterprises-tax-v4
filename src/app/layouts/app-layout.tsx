import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"

const navigationItems = [
  {
    label: "Dashboard",
    path: appConfig.routes.dashboard,
  },
  {
    label: "Clients",
    path: appConfig.routes.clients,
  },
  {
    label: "Tax Returns",
    path: appConfig.routes.returns,
  },
  {
    label: "Payments",
    path: appConfig.routes.payments,
  },
  {
    label: "Reports",
    path: appConfig.routes.reports,
  },
  {
    label: "Settings",
    path: appConfig.routes.settings,
  },
]

function getNavigationClassName({
  isActive,
}: {
  isActive: boolean
}) {
  const baseClasses =
    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors"

  if (isActive) {
    return `${baseClasses} bg-blue-700 text-white`
  }

  return `${baseClasses} text-slate-700 hover:bg-slate-100`
}

export function AppLayout() {
  const navigate = useNavigate()

  const {
    profile,
    signOut,
    isLoading,
  } = useAuth()

  async function handleSignOut() {
    await signOut()

    navigate(
      appConfig.routes.login,
      {
        replace: true,
      },
    )
  }

  const staffName =
    profile?.displayName ||
    [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(" ") ||
    profile?.email ||
    "Staff user"

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-semibold">
              {appConfig.name}
            </p>

            <p className="text-xs text-slate-400">
              Version {appConfig.version}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {staffName}
              </p>

              <p className="text-xs capitalize text-slate-400">
                {profile?.role.replaceAll("_", " ")}
              </p>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                void handleSignOut()
              }}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 border-b border-slate-200 pb-4 lg:hidden">
            <p className="text-sm font-semibold text-slate-950">
              {staffName}
            </p>

            <p className="text-xs capitalize text-slate-500">
              {profile?.role.replaceAll("_", " ")}
            </p>
          </div>

          <nav
            aria-label="Primary navigation"
            className="space-y-1"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={getNavigationClassName}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  )
}