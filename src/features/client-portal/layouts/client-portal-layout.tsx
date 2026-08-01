import {
  NavLink,
  Outlet,
} from "react-router-dom"

const navigation = [
  {
    label: "Dashboard",
    href: "/client/dashboard",
  },
  {
    label: "Tax Organizer",
    href: "/client/organizer/personal",
  },
  {
    label: "My Tax Returns",
    href: "/client/returns",
  },
  {
    label: "Documents",
    href: "/client/documents",
  },
  {
    label: "Messages",
    href: "/client/messages",
  },
  {
    label: "Payments",
    href: "/client/payments",
  },
  {
    label: "Profile",
    href: "/client/profile",
  },
]

export function ClientPortalLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold">
              Smith Enterprises Tax Portal
            </h1>

            <p className="text-sm text-slate-500">
              Secure Client Portal
            </p>
          </div>

          <button
            className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="w-72 border-r bg-white">
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-100",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}