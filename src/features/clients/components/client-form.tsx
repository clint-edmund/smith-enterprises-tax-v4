import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckCircle2,
  CircleUserRound,
  Contact,
  FileText,
  Home,
  MapPin,
  Save,
  ShieldCheck,
  X,
} from "lucide-react"
import {
  useEffect,
} from "react"
import {
  useForm,
} from "react-hook-form"

import {
  clientSchema,
  type ClientSchemaValues,
} from "@/features/clients/schemas/client-schema"
import type {
  ClientFormValues,
} from "@/features/clients/types/client.types"
import {
  formatPhoneInput,
} from "@/features/clients/utils/client-formatters"

interface ClientFormProps {
  defaultValues?: ClientFormValues
  submitLabel: string
  isSubmitting: boolean
  errorMessage?: string | null
  onSubmit: (
    values: ClientFormValues,
  ) => Promise<void>
  onCancel: () => void
}

const emptyValues: ClientFormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  preferredName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  birthDate: "",
  status: "active",
  notes: "",
}

const navigationItems = [
  {
    id: "identity",
    label: "Client Information",
    description: "Identity, birth date, and status",
    icon: CircleUserRound,
  },
  {
    id: "contact",
    label: "Contact Information",
    description: "Email and telephone numbers",
    icon: Contact,
  },
  {
    id: "address",
    label: "Mailing Address",
    description: "Primary correspondence address",
    icon: MapPin,
  },
  {
    id: "notes",
    label: "Internal Notes",
    description: "Office-only information",
    icon: FileText,
  },
]

export function ClientForm({
  defaultValues = emptyValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: {
      errors,
      isDirty,
    },
  } = useForm<ClientSchemaValues>({
    resolver: zodResolver(clientSchema),
    defaultValues,
    mode: "onBlur",
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const firstName = watch("firstName")
  const lastName = watch("lastName")
  const email = watch("email")
  const phone = watch("phone")
  const addressLine1 = watch("addressLine1")
  const city = watch("city")
  const state = watch("state")

  const completedSections = [
    Boolean(firstName.trim() && lastName.trim()),
    Boolean(email.trim() || phone.trim()),
    Boolean(
      addressLine1.trim() &&
        city.trim() &&
        state.trim(),
    ),
    true,
  ].filter(Boolean).length

  const completionPercentage =
    Math.round(
      (completedSections /
        navigationItems.length) *
        100,
    )

  function fieldClasses(
    hasError: boolean,
  ): string {
    const baseClasses =
      "w-full rounded-xl border bg-white px-3.5 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100"

    return hasError
      ? `${baseClasses} border-red-400 focus:border-red-600 focus:ring-red-100`
      : `${baseClasses} border-slate-300 focus:border-blue-600 focus:ring-blue-100`
  }

  async function submitForm(
    values: ClientSchemaValues,
  ) {
    await onSubmit(values)
  }

  function FieldError({
    message,
  }: {
    message?: string
  }) {
    if (!message) {
      return null
    }

    return (
      <p
        className="mt-1.5 text-sm font-medium text-red-700"
        role="alert"
      >
        {message}
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="space-y-6"
    >
      {errorMessage && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <p className="font-semibold">
            The client could not be saved
          </p>
          <p className="mt-1">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Home
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="font-bold text-slate-950">
                  Client Record
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Complete the sections below before saving.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">
                  Profile completion
                </span>
                <span className="text-slate-900">
                  {completionPercentage}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-700 transition-all"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>

            <nav
              className="mt-6 space-y-2"
              aria-label="Client form sections"
            >
              {navigationItems.map((item) => {
                const Icon = item.icon

                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="group flex items-start gap-3 rounded-2xl px-3 py-3 transition hover:bg-slate-50"
                  >
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-700">
                      <Icon
                        className="size-4"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </a>
                )
              })}
            </nav>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  className="mt-0.5 size-5 shrink-0 text-blue-700"
                  aria-hidden="true"
                />

                <p className="text-xs leading-5 text-blue-900">
                  Sensitive taxpayer information must only
                  be entered in approved secure fields and
                  workflows.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <section
            id="identity"
            className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <CircleUserRound
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Client Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the client&apos;s legal identity and
                  account status.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  First name
                  <span className="ml-1 text-red-600">
                    *
                  </span>
                </label>

                <input
                  id="firstName"
                  autoComplete="given-name"
                  {...register("firstName")}
                  disabled={isSubmitting}
                  className={fieldClasses(
                    Boolean(errors.firstName),
                  )}
                />

                <FieldError
                  message={errors.firstName?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="middleName"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Middle name
                </label>

                <input
                  id="middleName"
                  autoComplete="additional-name"
                  {...register("middleName")}
                  disabled={isSubmitting}
                  className={fieldClasses(
                    Boolean(errors.middleName),
                  )}
                />

                <FieldError
                  message={errors.middleName?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Last name
                  <span className="ml-1 text-red-600">
                    *
                  </span>
                </label>

                <input
                  id="lastName"
                  autoComplete="family-name"
                  {...register("lastName")}
                  disabled={isSubmitting}
                  className={fieldClasses(
                    Boolean(errors.lastName),
                  )}
                />

                <FieldError
                  message={errors.lastName?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="preferredName"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Preferred name
                </label>

                <input
                  id="preferredName"
                  {...register("preferredName")}
                  disabled={isSubmitting}
                  placeholder="Optional"
                  className={fieldClasses(
                    Boolean(errors.preferredName),
                  )}
                />

                <FieldError
                  message={errors.preferredName?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="birthDate"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Birth date
                </label>

                <input
                  id="birthDate"
                  type="date"
                  {...register("birthDate")}
                  disabled={isSubmitting}
                  className={fieldClasses(
                    Boolean(errors.birthDate),
                  )}
                />

                <FieldError
                  message={errors.birthDate?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Client status
                </label>

                <select
                  id="status"
                  {...register("status")}
                  disabled={isSubmitting}
                  className={fieldClasses(
                    Boolean(errors.status),
                  )}
                >
                  <option value="active">
                    Active
                  </option>
                  <option value="inactive">
                    Inactive
                  </option>
                  <option value="archived">
                    Archived
                  </option>
                </select>

                <FieldError
                  message={errors.status?.message}
                />
              </div>
            </div>
          </section>

          <section
            id="contact"
            className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Contact
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Contact Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add the best ways for staff to contact the
                  client.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  disabled={isSubmitting}
                  placeholder="client@example.com"
                  className={fieldClasses(
                    Boolean(errors.email),
                  )}
                />

                <FieldError
                  message={errors.email?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Primary phone
                </label>

                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...register("phone")}
                  onChange={(event) => {
                    setValue(
                      "phone",
                      formatPhoneInput(
                        event.target.value,
                      ),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    )
                  }}
                  disabled={isSubmitting}
                  placeholder="(301) 555-1212"
                  className={fieldClasses(
                    Boolean(errors.phone),
                  )}
                />

                <FieldError
                  message={errors.phone?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="alternatePhone"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Alternate phone
                </label>

                <input
                  id="alternatePhone"
                  type="tel"
                  {...register("alternatePhone")}
                  onChange={(event) => {
                    setValue(
                      "alternatePhone",
                      formatPhoneInput(
                        event.target.value,
                      ),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    )
                  }}
                  disabled={isSubmitting}
                  placeholder="(301) 555-1212"
                  className={fieldClasses(
                    Boolean(
                      errors.alternatePhone,
                    ),
                  )}
                />

                <FieldError
                  message={
                    errors.alternatePhone?.message
                  }
                />
              </div>
            </div>
          </section>

          <section
            id="address"
            className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <MapPin
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Mailing Address
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Record the client&apos;s preferred mailing
                  address.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="addressLine1"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Address line 1
                </label>

                <input
                  id="addressLine1"
                  autoComplete="address-line1"
                  {...register("addressLine1")}
                  disabled={isSubmitting}
                  placeholder="Street address"
                  className={fieldClasses(
                    Boolean(
                      errors.addressLine1,
                    ),
                  )}
                />

                <FieldError
                  message={
                    errors.addressLine1?.message
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="addressLine2"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Address line 2
                </label>

                <input
                  id="addressLine2"
                  autoComplete="address-line2"
                  {...register("addressLine2")}
                  disabled={isSubmitting}
                  placeholder="Apartment, suite, or unit"
                  className={fieldClasses(
                    Boolean(
                      errors.addressLine2,
                    ),
                  )}
                />

                <FieldError
                  message={
                    errors.addressLine2?.message
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  City
                </label>

                <input
                  id="city"
                  autoComplete="address-level2"
                  {...register("city")}
                  disabled={isSubmitting}
                  className={fieldClasses(
                    Boolean(errors.city),
                  )}
                />

                <FieldError
                  message={errors.city?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  State
                </label>

                <input
                  id="state"
                  maxLength={2}
                  autoComplete="address-level1"
                  {...register("state")}
                  onChange={(event) => {
                    setValue(
                      "state",
                      event.target.value
                        .toUpperCase()
                        .slice(0, 2),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    )
                  }}
                  disabled={isSubmitting}
                  placeholder="MD"
                  className={fieldClasses(
                    Boolean(errors.state),
                  )}
                />

                <FieldError
                  message={errors.state?.message}
                />
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  ZIP code
                </label>

                <input
                  id="postalCode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  {...register("postalCode")}
                  disabled={isSubmitting}
                  placeholder="20601"
                  className={fieldClasses(
                    Boolean(errors.postalCode),
                  )}
                />

                <FieldError
                  message={
                    errors.postalCode?.message
                  }
                />
              </div>
            </div>
          </section>

          <section
            id="notes"
            className="scroll-mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <FileText
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Internal Notes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add office-only context that helps staff
                  serve this client.
                </p>
              </div>
            </div>

            <textarea
              id="notes"
              rows={7}
              {...register("notes")}
              disabled={isSubmitting}
              placeholder="Enter internal notes..."
              className={`mt-6 ${fieldClasses(
                Boolean(errors.notes),
              )}`}
            />

            <FieldError
              message={errors.notes?.message}
            />

            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs leading-5 text-amber-900">
                Do not enter Social Security numbers,
                passwords, payment-card numbers, or banking
                credentials in this field.
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            {isSubmitting ? (
              <>
                <span className="size-2 animate-pulse rounded-full bg-blue-600" />
                <span className="font-semibold text-blue-700">
                  Saving client...
                </span>
              </>
            ) : isDirty ? (
              <>
                <span className="size-2 rounded-full bg-amber-500" />
                <span className="font-semibold text-amber-700">
                  Unsaved changes
                </span>
              </>
            ) : (
              <>
                <CheckCircle2
                  className="size-4 text-emerald-600"
                  aria-hidden="true"
                />
                <span className="font-semibold text-slate-600">
                  No unsaved changes
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X
                className="size-4"
                aria-hidden="true"
              />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <Save
                className="size-4"
                aria-hidden="true"
              />
              {isSubmitting
                ? "Saving..."
                : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
