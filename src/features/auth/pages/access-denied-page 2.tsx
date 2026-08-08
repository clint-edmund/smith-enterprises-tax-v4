import { Link } from "react-router-dom"

import { appConfig } from "@/config/app-config"

export function AccessDeniedPage() {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <h1 className="text-3xl font-bold">
        Access Denied
      </h1>

      <p className="mt-4 text-slate-600">
        You do not have permission to
        access this area.
      </p>

      <Link
        to={appConfig.routes.dashboard}
        className="mt-8 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white"
      >
        Return to Dashboard
      </Link>
    </section>
  )
}