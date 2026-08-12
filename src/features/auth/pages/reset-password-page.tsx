import {
  useState,
  type FormEvent,
} from "react"
import {
  Link,
  useNavigate,
} from "react-router-dom"

import {
  appConfig,
} from "@/config/app-config"
import {
  updateCurrentUserPassword,
} from "@/features/auth/services/auth-service"

const minimumPasswordLength = 12

function validatePassword(
  password: string,
): string | null {
  if (
    password.length <
    minimumPasswordLength
  ) {
    return `Password must contain at least ${minimumPasswordLength} characters.`
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter."
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter."
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number."
  }

  if (
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return "Password must contain at least one special character."
  }

  return null
}

export function ResetPasswordPage() {
  const navigate = useNavigate()

  const [
    password,
    setPassword,
  ] = useState("")

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("")

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage(null)

    const validationMessage =
      validatePassword(password)

    if (validationMessage) {
      setErrorMessage(
        validationMessage,
      )

      return
    }

    if (
      password !==
      confirmPassword
    ) {
      setErrorMessage(
        "The passwords do not match.",
      )

      return
    }

    setIsSubmitting(true)

    try {
      await updateCurrentUserPassword(
        password,
      )

      navigate(
        appConfig.routes.login,
        {
          replace: true,
          state: {
            passwordReset: true,
          },
        },
      )
    } catch (error) {
      console.error(
        "Password update failed:",
        error,
      )

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your password. The recovery link may have expired.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Staff Account Security
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Create a new password
        </h1>

        <p className="mt-2 leading-6 text-slate-600">
          Choose a new password for your Smith
          Enterprises staff account.
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            Password requirements
          </p>

          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>
              At least 12 characters
            </li>

            <li>
              At least one uppercase letter
            </li>

            <li>
              At least one lowercase letter
            </li>

            <li>
              At least one number
            </li>

            <li>
              At least one special character
            </li>
          </ul>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              New password
            </label>

            <input
              id="new-password"
              name="new-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(
                  event.target.value,
                )
              }}
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Confirm new password
            </label>

            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(
                  event.target.value,
                )
              }}
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>

        <Link
          to={appConfig.routes.login}
          className="mt-6 inline-flex text-sm font-semibold text-blue-700 hover:underline"
        >
          Return to sign in
        </Link>
      </div>
    </section>
  )
}