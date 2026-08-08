import {
  useEffect,
  useState,
  type FormEvent,
} from "react"

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom"

import {
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react"

import {
  useClientAuth,
} from "@/features/client-portal/hooks/use-client-auth"

interface LoginLocationState {
  from?: {
    pathname?: string
  }
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    const normalizedMessage =
      error.message.toLowerCase()

    if (
      normalizedMessage.includes(
        "invalid login credentials",
      )
    ) {
      return "The email address or password is incorrect."
    }

    if (
      normalizedMessage.includes(
        "email not confirmed",
      )
    ) {
      return "Please complete your account invitation before signing in."
    }

    if (
      normalizedMessage.includes(
        "not active",
      )
    ) {
      return "Your client portal account is not active. Please contact Smith Enterprises."
    }

    if (
      normalizedMessage.includes(
        "no client portal profile",
      )
    ) {
      return "This account is not connected to a client portal profile."
    }
  }

  return "We could not sign you in. Please verify your information and try again."
}

export function ClientLoginPage() {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  const {
    signIn,
    isAuthenticated,
    isLoading: isAuthLoading,
  } =
    useClientAuth()

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  useEffect(() => {
    setErrorMessage(
      null,
    )
  }, [
    email,
    password,
  ])

  if (
    !isAuthLoading &&
    isAuthenticated
  ) {
    return (
      <Navigate
        to="/client"
        replace
      />
    )
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const normalizedEmail =
      email
        .trim()
        .toLowerCase()

    if (!normalizedEmail) {
      setErrorMessage(
        "Enter your email address.",
      )

      return
    }

    if (!password) {
      setErrorMessage(
        "Enter your password.",
      )

      return
    }

    setIsSubmitting(
      true,
    )

    setErrorMessage(
      null,
    )

    try {
      await signIn({
        email: normalizedEmail,
        password,
      })

      const locationState =
        location.state as
          | LoginLocationState
          | null

      const destination =
        locationState?.from?.pathname ??
        "/client"

      navigate(
        destination,
        {
          replace: true,
        },
      )
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
        ),
      )
    } finally {
      setIsSubmitting(
        false,
      )
    }
  }

  const isBusy =
    isSubmitting ||
    isAuthLoading

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
                <ShieldCheck
                  className="h-7 w-7"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                Smith Enterprises
              </p>

              <h1 className="mt-4 max-w-lg text-4xl font-bold tracking-tight">
                Secure access to your tax information
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                View your return progress, documents, payments, and account information through our protected client portal.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start gap-3">
                <LockKeyhole
                  className="mt-0.5 h-5 w-5 shrink-0 text-blue-300"
                  aria-hidden="true"
                />

                <div>
                  <p className="font-semibold">
                    Authorized clients only
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Access is limited to clients who have received and completed a portal invitation.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <div className="lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white">
                  <ShieldCheck
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-blue-700">
                  Smith Enterprises
                </p>
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 lg:mt-0">
                Client portal sign in
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Enter the email address and password associated with your client portal account.
              </p>

              {errorMessage && (
                <div
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <form
                className="mt-8 space-y-5"
                onSubmit={handleSubmit}
              >
                <div>
                  <label
                    className="block text-sm font-semibold text-slate-800"
                    htmlFor="client-email"
                  >
                    Email address
                  </label>

                  <input
                    id="client-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    disabled={isBusy}
                    onChange={(
                      event,
                    ) => {
                      setEmail(
                        event.target.value,
                      )
                    }}
                    className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    placeholder="client@example.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <label
                      className="block text-sm font-semibold text-slate-800"
                      htmlFor="client-password"
                    >
                      Password
                    </label>

                    <span className="text-xs font-medium text-slate-500">
                      Password reset coming soon
                    </span>
                  </div>

                  <input
                    id="client-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    disabled={isBusy}
                    onChange={(
                      event,
                    ) => {
                      setPassword(
                        event.target.value,
                      )
                    }}
                    className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isBusy && (
                    <LoaderCircle
                      className="h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                  )}

                  {isBusy
                    ? "Signing in..."
                    : "Sign in securely"}
                </button>
              </form>

              <div className="mt-8 border-t border-slate-200 pt-6">
                <p className="text-center text-xs leading-5 text-slate-500">
                  Unauthorized access is prohibited. Activity may be monitored and recorded for security purposes.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}