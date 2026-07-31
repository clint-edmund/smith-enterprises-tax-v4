interface ReturnStatusBadgeProps {
  status: string
}

const statusStyles: Record<string, string> = {
  Intake:
    "bg-slate-100 text-slate-700",

  "Documents Pending":
    "bg-amber-100 text-amber-800",

  "Ready for Preparation":
    "bg-blue-100 text-blue-800",

  "In Preparation":
    "bg-indigo-100 text-indigo-800",

  Review:
    "bg-purple-100 text-purple-800",

  "Ready to File":
    "bg-emerald-100 text-emerald-800",

  Filed:
    "bg-green-100 text-green-800",

  Completed:
    "bg-green-200 text-green-900",

  "On Hold":
    "bg-red-100 text-red-800",
}

export function ReturnStatusBadge({
  status,
}: ReturnStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        statusStyles[status] ??
          "bg-slate-100 text-slate-700",
      ].join(" ")}
    >
      {status}
    </span>
  )
}