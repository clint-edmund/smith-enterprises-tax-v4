import type { WorkflowStatus } from "@/features/workflow/types/workflow.types"

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus
}

const workflowConfig: Record<
  WorkflowStatus,
  {
    label: string
    className: string
  }
> = {
  intake: {
    label: "Intake",
    className:
      "bg-slate-100 text-slate-800",
  },

  documents_pending: {
    label: "Documents Pending",
    className:
      "bg-amber-100 text-amber-800",
  },

  ready_for_preparation: {
    label: "Ready",
    className:
      "bg-sky-100 text-sky-800",
  },

  in_preparation: {
    label: "Preparing",
    className:
      "bg-blue-100 text-blue-800",
  },

  review: {
    label: "Review",
    className:
      "bg-violet-100 text-violet-800",
  },

  signature_pending: {
    label: "Signature",
    className:
      "bg-orange-100 text-orange-800",
  },

  ready_to_file: {
    label: "Ready To File",
    className:
      "bg-cyan-100 text-cyan-800",
  },

  filed: {
    label: "Filed",
    className:
      "bg-indigo-100 text-indigo-800",
  },

  completed: {
    label: "Completed",
    className:
      "bg-emerald-100 text-emerald-800",
  },

  on_hold: {
    label: "On Hold",
    className:
      "bg-red-100 text-red-800",
  },
}

export function WorkflowStatusBadge({
  status,
}: WorkflowStatusBadgeProps) {
  const workflow =
    workflowConfig[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${workflow.className}`}
    >
      {workflow.label}
    </span>
  )
}