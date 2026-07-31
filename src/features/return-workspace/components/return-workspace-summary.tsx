import {
  ReturnAssignmentCard,
} from "./return-assignment-card"

import {
  ReturnStatusBadge,
} from "./return-status-badge"

import type {
  ReturnWorkspaceSummary,
} from "../types/return-workspace.types"

interface ReturnWorkspaceSummaryProps {
  summary: ReturnWorkspaceSummary
}

export function ReturnWorkspaceSummary({
  summary,
}: ReturnWorkspaceSummaryProps) {
  return (
    <section
      className="
        grid
        gap-6
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        lg:grid-cols-[2fr_1fr]
      "
    >
      <div>
        <h1
          className="
            text-3xl
            font-bold
            text-slate-900
          "
        >
          {summary.clientName}
        </h1>

        <p
          className="
            mt-2
            text-lg
            text-slate-600
          "
        >
          {summary.taxYear} • {summary.returnType}
        </p>

        <div className="mt-5">
          <ReturnStatusBadge
            status={summary.status}
          />
        </div>
      </div>

      <div
        className="
          grid
          gap-4
        "
      >
        <ReturnAssignmentCard
          label="Assigned Preparer"
          value={summary.assignedPreparer}
        />

        <ReturnAssignmentCard
          label="Assigned Reviewer"
          value={summary.assignedReviewer}
        />

        <ReturnAssignmentCard
          label="Due Date"
          value={
            summary.dueDate ??
            "Not Scheduled"
          }
        />

        <ReturnAssignmentCard
          label="Outstanding Balance"
          value={`$${summary.outstandingBalance.toFixed(
            2,
          )}`}
        />
      </div>
    </section>
  )
}