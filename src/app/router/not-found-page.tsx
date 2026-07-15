import { Link } from "react-router-dom"

import { appConfig } from "@/config/app-config"

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Page not found
        </h1>

        <p className="mt-3 text-slate-600">
          The page you requested does not exist or may have moved.
        </p>

        <Link
          to={appConfig.routes.home}
          className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Return Home
        </Link>
      </section>
    </main>
  )
}