import { useNavigate } from "react-router-dom"

import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function AccountErrorPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()

    navigate(
      appConfig.routes.login,
      {
        replace: true,
      },
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-xl rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
          Account Configuration Error
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Staff profile unavailable
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Authentication succeeded, but the application could
          not find a matching staff profile. An administrator
          must verify this account before access can continue.
        </p>

        <p className="mt-5 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
          Signed-in account:{" "}
          <strong>
            {user?.email ?? "Unknown"}
          </strong>
        </p>

        <button
          type="button"
          onClick={() => {
            void handleSignOut()
          }}
          className="mt-6 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Sign Out
        </button>
      </section>
    </main>
  )
}