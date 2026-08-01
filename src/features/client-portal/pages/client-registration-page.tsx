import {
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react"
import {
  useMemo,
  useState,
  useTransition,
} from "react"
import {
  Link,
  useNavigate,
} from "react-router-dom"

import {
  activateClientPortalAccount,
} from "@/features/client-portal/services/client-activation-service"

import {
  appConfig,
} from "@/config/app-config"

interface PasswordRequirement {
  label: string
  isMet: boolean
}

type PasswordStrength =
  | "Empty"
  | "Weak"
  | "Fair"
  | "Good"
  | "Strong"
  | "Excellent"

function getPasswordRequirements(
  password: string,
): PasswordRequirement[] {
  return [
    {
      label: "At least 12 characters",
      isMet:
        password.length >= 12,
    },
    {
      label: "One uppercase letter",
      isMet:
        /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      isMet:
        /[a-z]/.test(password),
    },
    {
      label: "One number",
      isMet:
        /\d/.test(password),
    },
    {
      label: "One special character",
      isMet:
        /[^A-Za-z0-9]/.test(
          password,
        ),
    },
  ]
}

function getPasswordStrength(
  password: string,
  requirements: PasswordRequirement[],
): {
  label: PasswordStrength
  score: number
} {
  if (!password) {
    return {
      label: "Empty",
      score: 0,
    }
  }

  let score =
    requirements.filter(
      (requirement) =>
        requirement.isMet,
    ).length

  if (password.length >= 16) {
    score += 1
  }

  if (
    password.length >= 20 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(
      password,
    )
  ) {
    score += 1
  }

  if (score <= 1) {
    return {
      label: "Weak",
      score: 1,
    }
  }

  if (score === 2) {
    return {
      label: "Fair",
      score: 2,
    }
  }

  if (score === 3) {
    return {
      label: "Good",
      score: 3,
    }
  }

  if (score === 4) {
    return {
      label: "Strong",
      score: 4,
    }
  }

  return {
    label: "Excellent",
    score: 5,
  }
}

export function ClientRegistrationPage() {
  const [
    password,
    setPassword,
  ] = useState("")

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("")

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false)

  const [
    acceptedPrivacy,
    setAcceptedPrivacy,
  ] = useState(false)

  const navigate =
    useNavigate()

  const [
    isPending,
    startTransition,
  ] = useTransition()

  const [
    activationError,
    setActivationError,
  ] = useState<string | null>(
    null,
  )

  const [
    activationMessage,
    setActivationMessage,
  ] = useState<string | null>(
    null,
  )

  const passwordRequirements =
    useMemo(
      () =>
        getPasswordRequirements(
          password,
        ),
      [password],
    )

  const passwordStrength =
    useMemo(
      () =>
        getPasswordStrength(
          password,
          passwordRequirements,
        ),
      [
        password,
        passwordRequirements,
      ],
    )

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword

  const confirmPasswordHasError =
    confirmPassword.length > 0 &&
    !passwordsMatch

  const passwordRequirementsMet =
    passwordRequirements.every(
      (requirement) =>
        requirement.isMet,
    )

  const canActivateAccount =
    passwordRequirementsMet &&
    passwordsMatch &&
    acceptedTerms &&
    acceptedPrivacy

  const strengthSegments =
    Array.from(
      {
        length: 5,
      },
      (_, index) =>
        index <
        passwordStrength.score,
    )
  
  async function handleCreateAccount() {
  setActivationError(null)
  setActivationMessage(null)

  startTransition(async () => {
    try {
      const invitationToken =
        decodeURIComponent(
          window.location.hash.slice(1),
        )

      const response =
        await activateClientPortalAccount({
          email: "", // populated next phase
          password,
          invitationToken,
        })

      if (
        response.requiresEmailConfirmation
      ) {
        setActivationMessage(
          "Check your email to complete account activation.",
        )

        return
      }

      setActivationMessage(
        "Account successfully activated.",
      )

      navigate(
        appConfig.routes.clientDashboard,
      )
    } catch (error) {
      setActivationError(
        error instanceof Error
          ? error.message
          : "Unable to activate your account.",
      )
    }
  })
}
  
  return (
    <section className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-12">
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-slate-950 px-8 py-8 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck
                className="size-6"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
                Smith Enterprises
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                Create Your Secure Portal Account
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Complete your secure account setup to begin your tax organizer and
            safely exchange documents with your tax preparation team.
          </p>
        </header>

        <div className="space-y-8 p-8">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Invitation
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your secure invitation has been validated. Create a strong
              password to continue activating your portal account.
            </p>
          </section>

          <section
            aria-labelledby="account-setup-heading"
            className="rounded-2xl border border-slate-200 bg-white"
          >
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <LockKeyhole
                    className="size-5"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2
                    id="account-setup-heading"
                    className="text-lg font-bold text-slate-950"
                  >
                    Account Setup
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose a unique password that you do not use elsewhere.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <label
                  htmlFor="client-password"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="client-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(
                        event.target.value,
                      )
                    }}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    placeholder="Create a strong password"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() => {
                      setShowPassword(
                        (currentValue) =>
                          !currentValue,
                      )
                    }}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                  >
                    {showPassword ? (
                      <EyeOff
                        className="size-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        className="size-5"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Password strength
                  </p>

                  <p className="text-sm font-bold text-slate-700">
                    {passwordStrength.label}
                  </p>
                </div>

                <div
                  className="mt-3 grid grid-cols-5 gap-2"
                  aria-label={`Password strength: ${passwordStrength.label}`}
                >
                  {strengthSegments.map(
                    (
                      isActive,
                      index,
                    ) => (
                      <div
                        key={index}
                        className={[
                          "h-2 rounded-full transition",
                          isActive
                            ? "bg-blue-700"
                            : "bg-slate-200",
                        ].join(" ")}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-900">
                  Password requirements
                </p>

                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {passwordRequirements.map(
                    (requirement) => (
                      <li
                        key={
                          requirement.label
                        }
                        className="flex items-center gap-2 text-sm"
                      >
                        {requirement.isMet ? (
                          <CheckCircle2
                            className="size-4 shrink-0 text-emerald-600"
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle
                            className="size-4 shrink-0 text-slate-300"
                            aria-hidden="true"
                          />
                        )}

                        <span
                          className={
                            requirement.isMet
                              ? "font-medium text-emerald-800"
                              : "text-slate-600"
                          }
                        >
                          {
                            requirement.label
                          }
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <label
                  htmlFor="confirm-client-password"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Confirm password
                </label>

                <div className="relative mt-2">
                  <input
                    id="confirm-client-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value,
                      )
                    }}
                    autoComplete="new-password"
                    aria-invalid={
                      confirmPasswordHasError
                    }
                    aria-describedby="confirm-password-message"
                    className={[
                      "w-full rounded-xl border bg-white px-4 py-3 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4",
                      confirmPasswordHasError
                        ? "border-red-400 focus:border-red-600 focus:ring-red-100"
                        : "border-slate-300 focus:border-blue-600 focus:ring-blue-100",
                    ].join(" ")}
                    placeholder="Enter the password again"
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmed password"
                        : "Show confirmed password"
                    }
                    onClick={() => {
                      setShowConfirmPassword(
                        (currentValue) =>
                          !currentValue,
                      )
                    }}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        className="size-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        className="size-5"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>

                <p
                  id="confirm-password-message"
                  className={[
                    "mt-2 text-sm",
                    passwordsMatch
                      ? "font-medium text-emerald-700"
                      : confirmPasswordHasError
                        ? "font-medium text-red-700"
                        : "text-slate-500",
                  ].join(" ")}
                >
                  {passwordsMatch
                    ? "Passwords match."
                    : confirmPasswordHasError
                      ? "The passwords do not match."
                      : "Re-enter your password to confirm it."}
                </p>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => {
                      setAcceptedTerms(
                        event.target.checked,
                      )
                    }}
                    className="mt-1 size-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />

                  <span className="text-sm leading-6 text-slate-700">
                    I have read and agree to the{" "}
                    <Link
                      to={
                        appConfig.routes
                          .termsOfService
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      Terms of Service
                    </Link>
                    .
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(event) => {
                      setAcceptedPrivacy(
                        event.target.checked,
                      )
                    }}
                    className="mt-1 size-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />

                  <span className="text-sm leading-6 text-slate-700">
                    I have read and acknowledge the{" "}
                    <Link
                      to={
                        appConfig.routes
                          .privacyPolicy
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-bold text-slate-900">
                  Account setup progress
                </p>

                <ul className="mt-4 space-y-3">
                  <EligibilityItem
                    label="Password requirements met"
                    isComplete={
                      passwordRequirementsMet
                    }
                  />

                  <EligibilityItem
                    label="Passwords match"
                    isComplete={passwordsMatch}
                  />

                  <EligibilityItem
                    label="Terms of Service accepted"
                    isComplete={acceptedTerms}
                  />

                  <EligibilityItem
                    label="Privacy Policy acknowledged"
                    isComplete={acceptedPrivacy}
                  />
                </ul>
              </div>

              {activationError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {activationError}
                </div>
              )}

              {activationMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {activationMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={
                  !canActivateAccount ||
                  isPending
                }
                title={
                  canActivateAccount
                    ? "Account activation will be connected in the next phase."
                    : "Complete all account setup requirements."
                }
                className={[
                  "inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 font-semibold text-white transition",
                  canActivateAccount
                    ? "bg-blue-700 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                    : "cursor-not-allowed bg-blue-700 opacity-50",
                ].join(" ")}
              >
                {isPending
                  ? "Creating Account..."
                  : "Create Secure Account"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="font-bold text-blue-900">
              Your information is protected
            </h2>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-blue-800">
              <li>• Secure encrypted communication</li>
              <li>• Controlled document exchange</li>
              <li>• No Social Security numbers sent through email</li>
              <li>• Automatic session protection</li>
            </ul>
          </section>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to={
                appConfig.routes
                  .clientLogin
              }
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
interface EligibilityItemProps {
  label: string
  isComplete: boolean
}

function EligibilityItem({
  label,
  isComplete,
}: EligibilityItemProps) {
  return (
    <li className="flex items-center gap-3 text-sm">
      {isComplete ? (
        <CheckCircle2
          className="size-5 shrink-0 text-emerald-600"
          aria-hidden="true"
        />
      ) : (
        <Circle
          className="size-5 shrink-0 text-slate-300"
          aria-hidden="true"
        />
      )}

      <span
        className={
          isComplete
            ? "font-medium text-emerald-800"
            : "text-slate-600"
        }
      >
        {label}
      </span>
    </li>
  )
}