import { Link } from "react-router-dom"

import { appConfig } from "@/config/app-config"

export function LoginPage() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Authorized Users Only
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Sign in
        </h1>

        <p className="mt-2 text-slate-600">
          Authentication will be connected to Supabase during the
          authentication phase.
        </p>

        <form className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              disabled
              placeholder="name@example.com"
              className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              disabled
              placeholder="Password"
              className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500"
            />
          </div>

          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-slate-400 px-4 py-3 font-semibold text-white"
          >
            Authentication Coming in Phase 4
          </button>
        </form>

        <Link
          to={appConfig.routes.home}
          className="mt-6 inline-block text-sm font-semibold text-blue-700 hover:underline"
        >
          Return to home
        </Link>
      </div>
    </section>
  )
}