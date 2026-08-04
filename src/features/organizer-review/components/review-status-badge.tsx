export type ReviewStatus =
  | "not_started"
  | "in_progress"
  | "needs_attention"
  | "complete"
  | "waiting_on_client"
  | "under_review"
  | "approved"

interface ReviewStatusBadgeProps {
  status:
    ReviewStatus

  label?: string
}

const statusMetadata:
  Record<
    ReviewStatus,
    {
      label: string
      className: string
    }
  > = {
    not_started: {
      label:
        "Not Started",
      className:
        "bg-slate-100 text-slate-700",
    },

    in_progress: {
      label:
        "In Progress",
      className:
        "bg-blue-100 text-blue-800",
    },

    needs_attention: {
      label:
        "Needs Attention",
      className:
        "bg-amber-100 text-amber-800",
    },

    complete: {
      label:
        "Complete",
      className:
        "bg-emerald-100 text-emerald-800",
    },

    waiting_on_client: {
      label:
        "Waiting on Client",
      className:
        "bg-orange-100 text-orange-800",
    },

    under_review: {
      label:
        "Under Review",
      className:
        "bg-violet-100 text-violet-800",
    },

    approved: {
      label:
        "Approved",
      className:
        "bg-emerald-100 text-emerald-800",
    },
  }

export function ReviewStatusBadge({
  status,
  label,
}: ReviewStatusBadgeProps) {
  const metadata =
    statusMetadata[
      status
    ]

  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        metadata.className,
      ].join(" ")}
    >
      {label ??
        metadata.label}
    </span>
  )
}
