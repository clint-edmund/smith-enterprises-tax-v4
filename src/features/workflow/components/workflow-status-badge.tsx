import type { WorkflowStatus } from "@/features/workflow/types/workflow.types"

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus
}

const labels: Record<WorkflowStatus, string> = {
  intake: "Intake",
  documents_pending: "Documents Pending",
  ready_for_preparation: "Ready for Preparation",
  in_preparation: "In Preparation",
  review: "Review",
  signature_pending: "Signature Pending",
  ready_to_file: "Ready to File",
  filed: "Filed",
  completed: "Completed",
  on_hold: "On Hold",
}

const classes: Record<WorkflowStatus, string> = {
  intake: "border-slate-200 bg-slate-50 text-slate-700",
  documents_pending: "border-amber-200 bg-amber-50 text-amber-800",
  ready_for_preparation: "border-blue-200 bg-blue-50 text-blue-800",
  in_preparation: "border-indigo-200 bg-indigo-50 text-indigo-800",
  review: "border-violet-200 bg-violet-50 text-violet-800",
  signature_pending: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
  ready_to_file: "border-cyan-200 bg-cyan-50 text-cyan-800",
  filed: "border-sky-200 bg-sky-50 text-sky-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  on_hold: "border-red-200 bg-red-50 text-red-800",
}

export function WorkflowStatusBadge({
  status,
}: WorkflowStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {labels[status]}
    </span>
  )
}
