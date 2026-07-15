import {
  useState,
  type FormEvent,
} from "react"
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"

interface LoginLocationState {
  from?: string
}

function getLoginErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message
      .toLowerCase()
      .includes("invalid login credentials")
  ) {
    return "The email address or password is incorrect."
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Unable to sign in. Please try again."
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { signIn } = useAuth()

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const authenticatedProfile =
        await signIn({
          email,
          password,
      })

      if (!authenticatedProfile.isActive) {
        navigate(
          appConfig.routes.pendingApproval,
          {
            replace: true,
         },
       )

       return
      }

      const state =
        location.state as
          | LoginLocationState
          | null

      const destination =
        state?.from ??
        appConfig.routes.dashboard

      navigate(destination, {
        replace: true,
      })

    } catch (error) {
      setErrorMessage(
        getLoginErrorMessage(error),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Authorized Staff Only
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Sign in
        </h1>

        <p className="mt-2 text-slate-600">
          Enter your Smith Enterprises staff credentials.
        </p>

        {errorMessage && (
          <div
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
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
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
              }}
              autoComplete="email"
              required
              disabled={isSubmitting}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
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
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
              }}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting
              ? "Signing in..."
              : "Sign In"}
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