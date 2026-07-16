import type {
  LucideIcon,
} from "lucide-react"

interface SummaryCardProps {
  label: string
  value: string
  description: string
  icon: LucideIcon
}

export function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon
            className="size-6"
            aria-hidden="true"
          />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  )
}