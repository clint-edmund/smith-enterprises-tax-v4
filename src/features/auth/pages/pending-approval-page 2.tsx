import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function PendingApprovalPage() {
  const navigate = useNavigate()

  const {
    profile,
    signOut,
    refreshProfile,
  } = useAuth()

  const [message, setMessage] =
    useState<string | null>(null)

  const [isChecking, setIsChecking] =
    useState(false)

  async function handleCheckAccess() {
    setIsChecking(true)
    setMessage(null)

    try {
      await refreshProfile()

      setMessage(
        "Your account status has been refreshed. Sign out and sign back in if an administrator recently approved the account.",
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to refresh account status.",
      )
    } finally {
      setIsChecking(false)
    }
  }

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
      <section className="w-full max-w-xl rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
          Approval Required
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Account awaiting approval
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Your authentication was successful, but your staff
          profile has not been activated by an administrator.
          You cannot access client or tax-return information
          until approval is complete.
        </p>

        <dl className="mt-6 rounded-xl bg-slate-50 p-5">
          <div>
            <dt className="text-sm font-medium text-slate-500">
              Account
            </dt>

            <dd className="mt-1 font-semibold text-slate-900">
              {profile?.email ?? "Profile unavailable"}
            </dd>
          </div>

          <div className="mt-4">
            <dt className="text-sm font-medium text-slate-500">
              Current role
            </dt>

            <dd className="mt-1 font-semibold capitalize text-slate-900">
              {profile?.role.replaceAll("_", " ") ??
                "Not assigned"}
            </dd>
          </div>
        </dl>

        {message && (
          <div
            className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
            role="status"
          >
            {message}
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCheckAccess}
            disabled={isChecking}
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400"
          >
            {isChecking
              ? "Checking..."
              : "Check Access Again"}
          </button>

          <button
            type="button"
            onClick={() => {
              void handleSignOut()
            }}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50"
          >
            Sign Out
          </button>
        </div>
      </section>
    </main>
  )
}