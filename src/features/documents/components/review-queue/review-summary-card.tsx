import type {
  LucideIcon,
} from "lucide-react"

interface ReviewSummaryCardProps {
  label: string
  value: number
  icon: LucideIcon
  isActive?: boolean
  onClick?: () => void
}

export function ReviewSummaryCard({
  label,
  value,
  icon: Icon,
  isActive = false,
  onClick,
}: ReviewSummaryCardProps) {
  const cardClassName = [
    "w-full rounded-xl border p-5 text-left shadow-sm",
    "transition hover:-translate-y-0.5 hover:shadow-md",
    "focus:outline-none focus:ring-2 focus:ring-blue-500",
    isActive
      ? "border-blue-500 bg-blue-50"
      : "border-slate-200 bg-white",
  ].join(" ")

  return (
    <button
      type="button"
      className={cardClassName}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={[
            "rounded-lg p-2",
            isActive
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-600",
          ].join(" ")}
        >
          <Icon
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  )
}