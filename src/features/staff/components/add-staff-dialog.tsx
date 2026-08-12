import { MailPlus, X } from "lucide-react"
import { useEffect, useState } from "react"

import type { AppRole } from "@/features/auth/types/auth.types"

export interface AddStaffValues {
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  role: AppRole
}

interface AddStaffDialogProps {
  open: boolean
  isSubmitting: boolean
  errorMessage: string | null
  onCancel: () => void
  onConfirm: (values: AddStaffValues) => void
}

const roleLabels: Record<AppRole, string> = {
  administrator: "Administrator",
  manager: "Manager",
  preparer: "Preparer",
  reviewer: "Reviewer",
  receptionist: "Receptionist",
  read_only: "Read Only",
}

const roleOptions: AppRole[] = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
  "read_only",
]

const initialValues: AddStaffValues = {
  firstName: "",
  lastName: "",
  displayName: "",
  email: "",
  phone: "",
  role: "read_only",
}

export function AddStaffDialog({
  open,
  isSubmitting,
  errorMessage,
  onCancel,
  onConfirm,
}: AddStaffDialogProps) {
  const [values, setValues] =
    useState<AddStaffValues>(initialValues)
  const [validationMessage, setValidationMessage] =
    useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setValues(initialValues)
      setValidationMessage(null)
    }
  }, [open])

  if (!open) return null

  function updateValue<Key extends keyof AddStaffValues>(
    key: Key,
    value: AddStaffValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleSubmit() {
    const firstName = values.firstName.trim()
    const lastName = values.lastName.trim()
    const email = values.email.trim()

    if (!firstName || !lastName || !email) {
      setValidationMessage(
        "First name, last name, and email are required.",
      )
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationMessage(
        "Enter a valid email address.",
      )
      return
    }

    setValidationMessage(null)
    onConfirm({
      ...values,
      firstName,
      lastName,
      email,
      displayName: values.displayName.trim(),
      phone: values.phone.trim(),
    })
  }

  const displayedError =
    validationMessage ?? errorMessage

  const fieldClass =
    "rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-staff-dialog-title"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div className="flex gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <MailPlus className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Staff Administration
              </p>
              <h2
                id="add-staff-dialog-title"
                className="mt-1 text-xl font-bold text-slate-950"
              >
                Add Staff Member
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create the staff identity and send an invitation to sign in.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              First Name *
            </span>
            <input
              value={values.firstName}
              disabled={isSubmitting}
              autoComplete="given-name"
              onChange={(e) =>
                updateValue("firstName", e.target.value)
              }
              className={fieldClass}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Last Name *
            </span>
            <input
              value={values.lastName}
              disabled={isSubmitting}
              autoComplete="family-name"
              onChange={(e) =>
                updateValue("lastName", e.target.value)
              }
              className={fieldClass}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Display Name
            </span>
            <input
              value={values.displayName}
              disabled={isSubmitting}
              placeholder="Optional"
              onChange={(e) =>
                updateValue("displayName", e.target.value)
              }
              className={fieldClass}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Phone
            </span>
            <input
              type="tel"
              value={values.phone}
              disabled={isSubmitting}
              autoComplete="tel"
              placeholder="Optional"
              onChange={(e) =>
                updateValue("phone", e.target.value)
              }
              className={fieldClass}
            />
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              Email Address *
            </span>
            <input
              type="email"
              value={values.email}
              disabled={isSubmitting}
              autoComplete="email"
              placeholder="employee@example.com"
              onChange={(e) =>
                updateValue("email", e.target.value)
              }
              className={fieldClass}
            />
          </label>

          <label className="grid gap-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              Application Role *
            </span>
            <select
              value={values.role}
              disabled={isSubmitting}
              onChange={(e) =>
                updateValue(
                  "role",
                  e.target.value as AppRole,
                )
              }
              className={fieldClass}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </label>

          <div className="sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Access remains controlled
            </p>
            <p className="mt-1 text-sm leading-5 text-amber-800">
              The invitation creates the staff identity. Activation and
              authorization remain protected by the server-side staff
              administration workflow.
            </p>
          </div>

          {displayedError && (
            <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-900">
                Unable to send invitation
              </p>
              <p className="mt-1 text-sm text-red-700">
                {displayedError}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <MailPlus className="size-4" aria-hidden="true" />
            {isSubmitting ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  )
}
