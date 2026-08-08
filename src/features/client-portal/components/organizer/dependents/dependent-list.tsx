import {
  Plus,
} from "lucide-react"

import type {
  OrganizerDependent,
} from "@/features/client-portal/types/organizer-dependent.types"

import {
  DependentCard,
} from "./dependent-card"
import {
  DependentEmptyState,
} from "./dependent-empty-state"

interface DependentListProps {
  dependents:
    OrganizerDependent[]

  onAdd: () => void

  onEdit: (
    dependent:
      OrganizerDependent,
  ) => void

  onDelete: (
    dependent:
      OrganizerDependent,
  ) => void
}

export function DependentList({
  dependents,
  onAdd,
  onEdit,
  onDelete,
}: DependentListProps) {
  if (
    dependents.length === 0
  ) {
    return (
      <DependentEmptyState
        onAdd={onAdd}
      />
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Current Dependents
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Review the dependents currently included in this tax organizer.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <Plus
            className="h-4 w-4"
            aria-hidden="true"
          />

          Add Another Dependent
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {dependents.map(
          (dependent) => (
            <DependentCard
              key={
                dependent.dependentId
              }
              dependent={
                dependent
              }
              onEdit={
                onEdit
              }
              onDelete={
                onDelete
              }
            />
          ),
        )}
      </div>
    </section>
  )
}