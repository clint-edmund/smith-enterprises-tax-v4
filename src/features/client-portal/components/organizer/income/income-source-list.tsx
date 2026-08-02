import type {
  OrganizerIncomeSource,
} from "@/features/client-portal/types/organizer-income.types"

import {
  OrganizerCrudHeader,
  OrganizerEmptyState,
  OrganizerSummaryDashboard,
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

  const needsAttentionCount =
    incomeSources.length -
    completeRecordCount

  const completionPercentage =
    incomeSources.length === 0
      ? 0
      : (
          completeRecordCount /
          incomeSources.length
        ) * 100

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

      <OrganizerSummaryDashboard
        title="Income Summary"
        description="Monitor the completion status of this organizer's income information."
        progressPercentage={
          completionPercentage
        }
        metrics={[
          {
            key:
              "sources",
            label:
              "Income Sources",
            value:
              incomeSources.length,
            description:
              "Total income records",
          },
          {
            key:
              "complete",
            label:
              "Completed",
            value:
              completeRecordCount,
            description:
              "Ready for review",
          },
          {
            key:
              "documents",
            label:
              "Documents",
            value:
              `${receivedDocumentCount}/${incomeSources.length}`,
            description:
              "Supporting documents received",
          },
          {
            key:
              "attention",
            label:
              "Needs Attention",
            value:
              needsAttentionCount,
            description:
              "Records still in progress",
          },
        ]}
      />

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
