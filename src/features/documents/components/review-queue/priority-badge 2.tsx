import type {
  DocumentReviewPriorityCode,
} from "@/features/documents/types/review-queue.types"

interface PriorityBadgeProps {
  priority: DocumentReviewPriorityCode
}

const priorityStyles: Record<
  DocumentReviewPriorityCode,
  string
> = {
  overdue:
    "border-red-300 bg-red-100 text-red-700",

  due_today:
    "border-orange-300 bg-orange-100 text-orange-700",

  due_this_week:
    "border-amber-300 bg-amber-100 text-amber-800",

  upcoming:
    "border-emerald-300 bg-emerald-100 text-emerald-700",

  no_due_date:
    "border-slate-300 bg-slate-100 text-slate-700",
}

const priorityLabels: Record<
  DocumentReviewPriorityCode,
  string
> = {
  overdue: "Overdue",
  due_today: "Due Today",
  due_this_week: "This Week",
  upcoming: "Upcoming",
  no_due_date: "No Due Date",
}

export function PriorityBadge({
  priority,
}: PriorityBadgeProps) {
  return (
    <span
      className={[
        "inline-flex whitespace-nowrap rounded-full border px-2.5 py-1",
        "text-xs font-semibold",
        priorityStyles[priority],
      ].join(" ")}
    >
      {priorityLabels[priority]}
    </span>
  )
}