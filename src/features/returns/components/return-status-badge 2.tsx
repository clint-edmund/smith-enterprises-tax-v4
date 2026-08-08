import type {
  ReturnStatus,
} from "@/features/returns/types/return.types"
import {
  returnStatusLabels,
} from "@/features/returns/utils/return-formatters"

interface ReturnStatusBadgeProps {
  status: ReturnStatus
}

const statusClasses: Record<
  ReturnStatus,
  string
> = {
  not_started:
    "bg-slate-100 text-slate-700",

  documents_pending:
    "bg-amber-100 text-amber-800",

  in_progress:
    "bg-blue-100 text-blue-800",

  ready_for_review:
    "bg-violet-100 text-violet-800",

  under_review:
    "bg-purple-100 text-purple-800",

  ready_to_file:
    "bg-cyan-100 text-cyan-800",

  filed:
    "bg-indigo-100 text-indigo-800",

  accepted:
    "bg-emerald-100 text-emerald-800",

  rejected:
    "bg-red-100 text-red-800",

  completed:
    "bg-green-100 text-green-800",

  on_hold:
    "bg-orange-100 text-orange-800",
}

export function ReturnStatusBadge({
  status,
}: ReturnStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {returnStatusLabels[status]}
    </span>
  )
}