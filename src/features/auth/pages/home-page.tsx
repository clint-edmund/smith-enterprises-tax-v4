import { Link } from "react-router-dom"

import { appConfig } from "@/config/app-config"

export function HomePage() {
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
          A secure system for managing clients, tax returns,
          payments, documents, assignments, and reporting.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={appConfig.routes.login}
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Sign In
          </Link>

          <Link
            to={appConfig.routes.dashboard}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Preview Dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}