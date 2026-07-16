import {
  useState,
  type ChangeEvent,
} from "react"
import {
  useLocation,
  useNavigate,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"
import { securityNotice } from "@/config/security-notice"
import { useAuth } from "@/features/auth/hooks/use-auth"

interface SecurityLocationState {
  from?: string
}

export function SecurityAcknowledgmentPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    profile,
    acceptSecurityNotice,
    signOut,
  } = useAuth()

  const [isConfirmed, setIsConfirmed] =
    useState(false)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  function handleConfirmationChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setIsConfirmed(event.target.checked)
  }

  async function handleAccept() {
    if (!isConfirmed) {
      setErrorMessage(
        "You must confirm that you understand and accept the authorized-use requirements.",
      )

      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await acceptSecurityNotice()

      const state =
        location.state as
          | SecurityLocationState
          | null

      navigate(
        state?.from ??
          appConfig.routes.dashboard,
        {
          replace: true,
        },
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The acknowledgment could not be recorded.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDecline() {
    await signOut()

    navigate(
      appConfig.routes.login,
      {
        replace: true,
      },
    )
  }

  const staffName =
    profile?.displayName ||
    [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(" ") ||
    profile?.email ||
    "Staff user"

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl">
        <header className="border-b border-red-800 bg-red-950 px-6 py-6 text-white sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-200">
            Warning — Authorized Users Only
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            {securityNotice.title}
          </h1>
        </header>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
            <p className="font-semibold text-amber-950">
              {securityNotice.shortWarning}
            </p>
          </div>

          <div className="space-y-4 text-sm leading-7 text-slate-700 sm:text-base">
            {securityNotice.paragraphs.map(
              (paragraph) => (
                <p key={paragraph}>
                  {paragraph}
                </p>
              ),
            )}
          </div>

          <dl className="grid gap-4 rounded-xl bg-slate-100 p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Staff account
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {staffName}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notice version
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {securityNotice.version}
              </dd>
            </div>
          </dl>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-4">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={
                handleConfirmationChange
              }
              disabled={isSubmitting}
              className="mt-1 size-5"
            />

            <span className="text-sm leading-6 text-slate-800">
              I am an authorized user. I have read,
              understand, and accept the security,
              privacy, monitoring, and authorized-use
              requirements above.
            </span>
          </label>

          {errorMessage && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                void handleDecline()
              }}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Decline and Sign Out
            </button>

            <button
              type="button"
              onClick={() => {
                void handleAccept()
              }}
              disabled={
                !isConfirmed ||
                isSubmitting
              }
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting
                ? "Recording Acceptance..."
                : "Accept and Continue"}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}