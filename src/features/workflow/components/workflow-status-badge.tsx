import { workflowStatusLabels } from "../constants/workflow-statuses"
import type { WorkflowStatus } from "../types/workflow.types"

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus
}

function getStatusClasses(
  status: WorkflowStatus,
): string {
  switch (status) {
    case "intake":
      return "bg-slate-100 text-slate-700 ring-slate-200"

    case "documents_pending":
      return "bg-amber-50 text-amber-800 ring-amber-200"

    case "ready_for_preparation":
      return "bg-blue-50 text-blue-800 ring-blue-200"

    case "in_preparation":
      return "bg-indigo-50 text-indigo-800 ring-indigo-200"

    case "review":
      return "bg-purple-50 text-purple-800 ring-purple-200"

    case "signature_pending":
      return "bg-orange-50 text-orange-800 ring-orange-200"

    case "ready_to_file":
      return "bg-cyan-50 text-cyan-800 ring-cyan-200"

    case "filed":
      return "bg-teal-50 text-teal-800 ring-teal-200"

    case "completed":
      return "bg-green-50 text-green-800 ring-green-200"

    case "on_hold":
      return "bg-red-50 text-red-800 ring-red-200"
  }
}

export function WorkflowStatusBadge({
  status,
}: WorkflowStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
        status,
      )}`}
    >
      {workflowStatusLabels[status]}
    </span>
  )
}