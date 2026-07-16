import {
  ClipboardCheck,
  UserRound,
} from "lucide-react"

import type {
  TaxReturnDetails,
} from "@/features/returns/types/return.types"

interface ReturnAssignmentSummaryProps {
  taxReturn: TaxReturnDetails
}

interface AssignmentItemProps {
  label: string
  name: string | null
  email: string | null
  icon:
    typeof UserRound
}

function AssignmentItem({
  label,
  name,
  email,
  icon: Icon,
}: AssignmentItemProps) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
      <Icon
        className="mt-0.5 size-5 shrink-0 text-blue-700"
        aria-hidden="true"
      />

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 truncate font-semibold text-slate-950">
          {name || "Unassigned"}
        </p>

        {email && (
          <p className="mt-1 truncate text-xs text-slate-500">
            {email}
          </p>
        )}
      </div>
    </div>
  )
}

export function ReturnAssignmentSummary({
  taxReturn,
}: ReturnAssignmentSummaryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-slate-950">
        Staff assignments
      </h2>

      <div className="mt-5 space-y-3">
        <AssignmentItem
          label="Preparer"
          name={
            taxReturn.assignedPreparerName
          }
          email={
            taxReturn.assignedPreparerEmail
          }
          icon={UserRound}
        />

        <AssignmentItem
          label="Reviewer"
          name={
            taxReturn.assignedReviewerName
          }
          email={
            taxReturn.assignedReviewerEmail
          }
          icon={ClipboardCheck}
        />
      </div>
    </section>
  )
}