import type { DocumentStatus } from "../types/document-status"

interface DocumentStatusBadgeProps {
  status: DocumentStatus
}

const statusStyles: Record<DocumentStatus, string> = {
  missing:
    "border-red-200 bg-red-50 text-red-700",
  suggested:
    "border-amber-200 bg-amber-50 text-amber-700",
  received:
    "border-blue-200 bg-blue-50 text-blue-700",
  verified:
    "border-green-200 bg-green-50 text-green-700",
  "not-required":
    "border-slate-200 bg-slate-50 text-slate-600",
}

const statusLabels: Record<DocumentStatus, string> = {
  missing: "Missing",
  suggested: "Suggested Match",
  received: "Received",
  verified: "Verified",
  "not-required": "Not Required",
}

export function DocumentStatusBadge({
  status,
}: DocumentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}