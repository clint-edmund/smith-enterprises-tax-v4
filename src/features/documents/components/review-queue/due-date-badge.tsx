import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isValid,
} from "date-fns"

interface DueDateBadgeProps {
  dueDate: string | null
}

export function DueDateBadge({
  dueDate,
}: DueDateBadgeProps) {
  if (!dueDate) {
    return (
      <span className="text-sm text-slate-500">
        Not assigned
      </span>
    )
  }

  const parsedDueDate =
    new Date(dueDate)

  if (!isValid(parsedDueDate)) {
    return (
      <span className="text-sm text-slate-500">
        Invalid date
      </span>
    )
  }

  const now =
    new Date()

  const formattedDate =
    format(
      parsedDueDate,
      "MMM d, yyyy",
    )

  if (isToday(parsedDueDate)) {
    return (
      <div>
        <p className="text-sm font-semibold text-orange-700">
          Due today
        </p>

        <p className="text-xs text-slate-500">
          {formattedDate}
        </p>
      </div>
    )
  }

  if (parsedDueDate < now) {
    return (
      <div>
        <p className="text-sm font-semibold text-red-700">
          Overdue by{" "}
          {formatDistanceToNowStrict(
            parsedDueDate,
          )}
        </p>

        <p className="text-xs text-slate-500">
          {formattedDate}
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-700">
        Due in{" "}
        {formatDistanceToNowStrict(
          parsedDueDate,
        )}
      </p>

      <p className="text-xs text-slate-500">
        {formattedDate}
      </p>
    </div>
  )
}