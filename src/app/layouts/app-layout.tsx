import { NavLink, Outlet } from "react-router-dom"

import { appConfig } from "@/config/app-config"

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
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-semibold">{appConfig.name}</p>

            <p className="text-xs text-slate-400">
              Version {appConfig.version}
            </p>
          </div>

          <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
            {appConfig.environment}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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