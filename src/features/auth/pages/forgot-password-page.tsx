import {
  useState,
  type FormEvent,
} from "react"
import {
  Link,
} from "react-router-dom"

import {
  appConfig,
} from "@/config/app-config"
import {
  requestPasswordReset,
} from "@/features/auth/services/auth-service"

export function ForgotPasswordPage() {
  const [
    email,
    setEmail,
  ] = useState("")

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    isComplete,
    setIsComplete,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await requestPasswordReset(email)

      setIsComplete(true)
    } catch (error) {
      console.error(
        "Password recovery request failed:",
        error,
      )

      /*
       * Do not reveal whether an account
       * exists for the submitted email.
       */
      setIsComplete(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Password Recovery
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Check your email
          </h1>

          <p className="mt-4 leading-6 text-slate-600">
            If an eligible staff account exists for that
            email address, password reset instructions
            will be sent to it.
          </p>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm leading-6 text-blue-900">
              Follow the secure link in the email to
              create a new password. The link may expire
              for security reasons.
            </p>
          </div>

          <Link
            to={appConfig.routes.login}
            className="mt-6 inline-flex font-semibold text-blue-700 hover:underline"
          >
            Return to sign in
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Staff Account Recovery
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Forgot your password?
        </h1>

        <p className="mt-2 leading-6 text-slate-600">
          Enter the email address associated with your
          Smith Enterprises staff account.
        </p>

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
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="recovery-email"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Email address
            </label>

            <input
              id="recovery-email"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              email.trim().length === 0
            }
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting
              ? "Sending..."
              : "Send Reset Instructions"}
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