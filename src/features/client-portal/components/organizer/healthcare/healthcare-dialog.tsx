import {
  X,
} from "lucide-react"

import {
  HealthcareCoverageForm,
} from "./healthcare-coverage-form"

import type {
  CreateOrganizerHealthcareCoverageRequest,
  OrganizerHealthcareCoverage,
  UpdateOrganizerHealthcareCoverageRequest,
} from "@/features/client-portal/types/organizer-healthcare.types"

interface HealthcareDialogProps {
  isOpen: boolean

  organizerId: string

  coverage?:
    OrganizerHealthcareCoverage | null

  isSaving?: boolean

  onClose: () => void

  onCreate: (
    request:
      CreateOrganizerHealthcareCoverageRequest,
  ) => Promise<void>

  onUpdate: (
    request:
      UpdateOrganizerHealthcareCoverageRequest,
  ) => Promise<void>
}

export function HealthcareDialog({
  isOpen,
  organizerId,
  coverage = null,
  isSaving = false,
  onClose,
  onCreate,
  onUpdate,
}: HealthcareDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="healthcare-dialog-title"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={
              onClose
            }
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close healthcare coverage form"
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>

        <div
          id="healthcare-dialog-title"
          className="sr-only"
        >
          {coverage
            ? "Edit healthcare coverage"
            : "Add healthcare coverage"}
        </div>

        <HealthcareCoverageForm
          organizerId={
            organizerId
          }
          coverage={
            coverage
          }
          isSaving={
            isSaving
          }
          onCancel={
            onClose
          }
          onCreate={
            onCreate
          }
          onUpdate={
            onUpdate
          }
        />
      </div>
    </div>
  )
}
