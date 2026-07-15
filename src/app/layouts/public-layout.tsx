import { Outlet } from "react-router-dom"

import { appConfig } from "@/config/app-config"

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <p className="font-semibold text-slate-950">
            {appConfig.name}
          </p>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}