import { Link } from "react-router-dom"

import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function HomePage() {
  const {
    isAuthenticated,
    isApproved,
  } = useAuth()

  let destination: string =
    appConfig.routes.login

  let buttonLabel =
    "Staff Sign In"

  if (isAuthenticated && isApproved) {
    destination =
      appConfig.routes.dashboard

    buttonLabel =
      "Open Dashboard"
  } else if (isAuthenticated) {
    destination =
      appConfig.routes.pendingApproval

    buttonLabel =
      "View Account Status"
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Secure Tax Management
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          {appConfig.name}
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          A secure staff system for managing clients, tax
          returns, payments, documents, assignments, and
          reporting.
        </p>

        <div className="mt-8">
          <Link
            to={destination}
            className="inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}