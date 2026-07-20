import { zodResolver } from "@hookform/resolvers/zod"
import {
  Save,
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
    formState: {
      errors,
    },
  } = useForm<ClientSchemaValues>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  function fieldClasses(
    hasError: boolean,
  ): string {
    const baseClasses =
      "w-full rounded-lg border bg-white px-3 py-2 text-slate-950 outline-none transition focus:ring-4 disabled:bg-slate-100"

    return hasError
      ? `${baseClasses} border-red-400 focus:border-red-600 focus:ring-red-100`
      : `${baseClasses} border-slate-300 focus:border-blue-600 focus:ring-blue-100`
  }

  async function submitForm(
    values: ClientSchemaValues,
  ) {
    await onSubmit(values)
  }

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="space-y-8"
    >
      {errorMessage && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Client information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              First name
            </label>

            <input
              id="firstName"
              {...register("firstName")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.firstName),
              )}
            />

            {errors.firstName && (
              <p className="mt-1 text-sm text-red-700">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="middleName"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Middle name
            </label>

            <input
              id="middleName"
              {...register("middleName")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.middleName),
              )}
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Last name
            </label>

            <input
              id="lastName"
              {...register("lastName")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.lastName),
              )}
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-700">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="preferredName"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Preferred name
            </label>

            <input
              id="preferredName"
              {...register("preferredName")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.preferredName),
              )}
            />
          </div>

          <div>
            <label
              htmlFor="birthDate"
              className="mb-2 block text-sm font-medium text-slate-800"
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

            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-700">
                {errors.birthDate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Status
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
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Contact information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              {...register("email")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.email),
              )}
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-700">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Primary phone
            </label>

            <input
              id="phone"
              type="tel"
              {...register("phone")}
              onChange={(event) => {
                setValue(
                  "phone",
                  formatPhoneInput(
                    event.target.value,
                  ),
                  {
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

            {errors.phone && (
              <p className="mt-1 text-sm text-red-700">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="alternatePhone"
              className="mb-2 block text-sm font-medium text-slate-800"
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
                    shouldValidate: true,
                  },
                )
              }}
              disabled={isSubmitting}
              placeholder="(301) 555-1212"
              className={fieldClasses(
                Boolean(errors.alternatePhone),
              )}
            />

            {errors.alternatePhone && (
              <p className="mt-1 text-sm text-red-700">
                {errors.alternatePhone.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Mailing address
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="addressLine1"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Address line 1
            </label>

            <input
              id="addressLine1"
              {...register("addressLine1")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.addressLine1),
              )}
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="addressLine2"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Address line 2
            </label>

            <input
              id="addressLine2"
              {...register("addressLine2")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.addressLine2),
              )}
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              City
            </label>

            <input
              id="city"
              {...register("city")}
              disabled={isSubmitting}
              className={fieldClasses(
                Boolean(errors.city),
              )}
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              State
            </label>

            <input
              id="state"
              maxLength={2}
              {...register("state")}
              onChange={(event) => {
                setValue(
                  "state",
                  event.target.value
                    .toUpperCase()
                    .slice(0, 2),
                  {
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

            {errors.state && (
              <p className="mt-1 text-sm text-red-700">
                {errors.state.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="postalCode"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              ZIP code
            </label>

            <input
              id="postalCode"
              {...register("postalCode")}
              disabled={isSubmitting}
              placeholder="20601"
              className={fieldClasses(
                Boolean(errors.postalCode),
              )}
            />

            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-700">
                {errors.postalCode.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Internal notes
        </h2>

        <textarea
          id="notes"
          rows={6}
          {...register("notes")}
          disabled={isSubmitting}
          className={`mt-5 ${fieldClasses(
            Boolean(errors.notes),
          )}`}
        />

        <p className="mt-2 text-xs text-slate-500">
          Do not enter Social Security numbers,
          passwords, payment-card numbers, or banking
          credentials in this field.
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <X className="size-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <Save className="size-4" />

          {isSubmitting
            ? "Saving..."
            : submitLabel}
        </button>
      </div>
    </form>
  )
}