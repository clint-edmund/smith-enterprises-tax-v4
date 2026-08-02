import {
  Calendar,
  Pencil,
  Shield,
  Trash2,
  User,
} from "lucide-react"

import type {
  OrganizerDependent,
} from "@/features/client-portal/types/organizer-dependent.types"

interface DependentCardProps {
  dependent: OrganizerDependent

  hasSecureSsn?: boolean

  onEdit: (
    dependent: OrganizerDependent,
  ) => void

  onDelete: (
    dependent: OrganizerDependent,
  ) => void
}

export function DependentCard({
  dependent,
  hasSecureSsn = false,
  onEdit,
  onDelete,
}: DependentCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <User
              className="h-6 w-6 text-blue-700"
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {dependent.firstName}{" "}
              {dependent.lastName}
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              {dependent.relationship
                .replaceAll("_", " ")
                .replace(
                  /\b\w/g,
                  (letter) =>
                    letter.toUpperCase(),
                )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              onEdit(
                dependent,
              )
            }
            className="rounded-lg border p-2 hover:bg-slate-100"
            aria-label="Edit dependent"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(
                dependent,
              )
            }
            className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
            aria-label="Delete dependent"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <Calendar className="h-4 w-4" />
          <span>
            {dependent.birthDate}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <Shield className="h-4 w-4 text-emerald-600" />

          <span>
            {hasSecureSsn
              ? "SSN Stored Securely"
              : "SSN Not Yet Added"}
          </span>
        </div>

        {dependent.isFullTimeStudent && (
          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            Student
          </span>
        )}

        {dependent.isPermanentlyDisabled && (
          <span className="ml-2 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
            Disabled
          </span>
        )}
      </div>
    </article>
  )
}