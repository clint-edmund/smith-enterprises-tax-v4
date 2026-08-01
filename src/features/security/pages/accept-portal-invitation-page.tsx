import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import {
  useEffect,
  useState,
} from "react"

import {
  validatePortalInvitation,
} from "@/features/security/services/portal-validation-service"
import type {
  PortalInvitationValidation,
} from "@/features/security/types/portal-validation.types"
import {
  hashPortalToken,
} from "@/features/security/utils/portal-token"

type PageState =
  | "loading"
  | "valid"
  | "invalid"
  | "expired"
  | "revoked"
  | "accepted"

function formatExpirationDate(
  value: string,
): string {
  const parsedDate =
    new Date(value)

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(parsedDate)
}

function getPageState(
  validation: PortalInvitationValidation,
): PageState {
  if (
    validation.invitationStatus ===
    "accepted"
  ) {
    return "accepted"
  }

  if (
    validation.invitationStatus ===
    "revoked"
  ) {
    return "revoked"
  }

  if (
    validation.invitationStatus ===
      "expired" ||
    new Date(
      validation.expiresAt,
    ).getTime() <= Date.now()
  ) {
    return "expired"
  }

  return "valid"
}

export function AcceptPortalInvitationPage() {

  const [
    pageState,
    setPageState,
  ] = useState<PageState>(
    "loading",
  )

  const [
    validation,
    setValidation,
  ] =
    useState<PortalInvitationValidation | null>(
      null,
    )

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  )

  useEffect(() => {
    let isCancelled = false

    async function loadInvitation() {
      const rawHash =
        window.location.hash.slice(1)

      const rawToken =
        decodeURIComponent(
          rawHash,
        ).trim()

      if (!rawToken) {
        setPageState("invalid")
        setErrorMessage(
          "The invitation link is missing its secure token.",
        )
        return
      }

      try {
        setPageState("loading")
        setErrorMessage(null)

        const tokenHash =
          await hashPortalToken(
            rawToken,
          )

        const result =
          await validatePortalInvitation(
            tokenHash,
          )

        if (isCancelled) {
          return
        }

        setValidation(result)
        setPageState(
          getPageState(result),
        )
      } catch (error) {
        if (isCancelled) {
          return
        }

        console.error(
          "Unable to validate portal invitation:",
          error,
        )

        setValidation(null)
        setPageState("invalid")
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The invitation could not be validated.",
        )
      }
    }

    void loadInvitation()

    return () => {
      isCancelled = true
    }
    }, [])

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck
                className="size-6"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
                Smith Enterprises
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Secure Client Portal
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300">
            Use this protected invitation to begin your secure tax-intake
            process and exchange information with your tax-preparation team.
          </p>
        </header>

        <section
          aria-live="polite"
          className="p-6 sm:p-10"
        >
          {pageState === "loading" && (
            <div
              role="status"
              className="py-10 text-center"
            >
              <div className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Validating invitation
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Please wait while we verify your secure invitation.
              </p>
            </div>
          )}

          {pageState === "valid" &&
            validation && (
              <div>
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2
                    className="size-7"
                    aria-hidden="true"
                  />
                </div>

                <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                  Welcome,{" "}
                  {validation.clientName}
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Your tax preparer has invited you to create a secure portal
                  account and begin your tax organizer.
                </p>

                <dl className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Portal email
                    </dt>

                    <dd className="mt-2 break-words font-semibold text-slate-950">
                      {validation.email}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Invitation expires
                    </dt>

                    <dd className="mt-2 font-semibold text-slate-950">
                      {formatExpirationDate(
                        validation.expiresAt,
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex gap-3">
                    <LockKeyhole
                      className="mt-0.5 size-5 shrink-0 text-blue-700"
                      aria-hidden="true"
                    />

                    <div>
                      <h3 className="font-bold text-blue-950">
                        Your information is protected
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-blue-800">
                        Sensitive tax information will be collected through
                        secure, access-controlled workflows rather than email.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  title="Account activation will be enabled in the next phase."
                  className="mt-7 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white opacity-60 sm:w-auto"
                >
                  Continue to Account Setup
                </button>

                <p className="mt-3 text-xs text-slate-500">
                  Account setup will be enabled in the next implementation
                  phase.
                </p>
              </div>
            )}

          {pageState === "expired" && (
            <StatusMessage
              icon={Clock3}
              title="Invitation expired"
              description="This invitation is no longer valid. Contact Smith Enterprises and request a new portal invitation."
              tone="amber"
            />
          )}

          {pageState === "revoked" && (
            <StatusMessage
              icon={XCircle}
              title="Invitation revoked"
              description="This invitation was withdrawn and can no longer be used. Contact Smith Enterprises for assistance."
              tone="red"
            />
          )}

          {pageState === "accepted" && (
            <StatusMessage
              icon={CheckCircle2}
              title="Invitation already accepted"
              description="This portal invitation has already been used. Continue through the portal sign-in page when account login is enabled."
              tone="emerald"
            />
          )}

          {pageState === "invalid" && (
            <StatusMessage
              icon={AlertTriangle}
              title="Invitation unavailable"
              description={
                errorMessage ??
                "This invitation is invalid or no longer available."
              }
              tone="red"
            />
          )}
        </section>

        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-5 text-center sm:px-10">
          <p className="text-xs leading-5 text-slate-500">
            Never email Social Security numbers, bank information, or tax
            documents. Submit restricted information only through the secure
            client portal.
          </p>
        </footer>
      </div>
    </main>
  )
}

interface StatusMessageProps {
  icon: typeof AlertTriangle
  title: string
  description: string
  tone:
    | "amber"
    | "red"
    | "emerald"
}

function StatusMessage({
  icon: Icon,
  title,
  description,
  tone,
}: StatusMessageProps) {
  const toneClasses = {
    amber:
      "border-amber-200 bg-amber-50 text-amber-800",
    red:
      "border-red-200 bg-red-50 text-red-800",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  }[tone]

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-6 ${toneClasses}`}
    >
      <Icon
        className="size-8"
        aria-hidden="true"
      />

      <h2 className="mt-4 text-xl font-bold">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6">
        {description}
      </p>
    </div>
  )
}
