import type {
  OrganizerIncomeSource,
} from "@/features/client-portal/types/organizer-income.types"

import {
  OrganizerCrudHeader,
  OrganizerEmptyState,
} from "@/features/client-portal/components/organizer/shared"

import {
  IncomeSourceCard,
} from "./income-source-card"

interface IncomeSourceListProps {
  incomeSources:
    OrganizerIncomeSource[]

  onAdd: () => void

  onEdit: (
    incomeSource:
      OrganizerIncomeSource,
  ) => void

  onDelete: (
    incomeSource:
      OrganizerIncomeSource,
  ) => void
}

export function IncomeSourceList({
  incomeSources,
  onAdd,
  onEdit,
  onDelete,
}: IncomeSourceListProps) {
  if (
    incomeSources.length === 0
  ) {
    return (
      <OrganizerEmptyState
        title="No Income Sources Added"
        description="Add each W-2, 1099, retirement statement, or other source of income that applies to this tax organizer."
        actionLabel="Add Income Source"
        onAction={
          onAdd
        }
      />
    )
  }

  const receivedDocumentCount =
    incomeSources.filter(
      (incomeSource) =>
        incomeSource.documentReceived,
    ).length

  const completeRecordCount =
    incomeSources.filter(
      (incomeSource) =>
        incomeSource.recordStatus ===
        "complete",
    ).length

  return (
    <section className="space-y-6">
      <OrganizerCrudHeader
        title="Income Sources"
        description="Review the income records currently included in this tax organizer."
        addLabel="Add Income Source"
        onAdd={
          onAdd
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Total Sources
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {
              incomeSources.length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Documents Received
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {receivedDocumentCount}
            <span className="ml-1 text-base font-medium text-slate-500">
              /{" "}
              {
                incomeSources.length
              }
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Complete Records
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {completeRecordCount}
            <span className="ml-1 text-base font-medium text-slate-500">
              /{" "}
              {
                incomeSources.length
              }
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {incomeSources.map(
          (incomeSource) => (
            <IncomeSourceCard
              key={
                incomeSource.incomeSourceId
              }
              incomeSource={
                incomeSource
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