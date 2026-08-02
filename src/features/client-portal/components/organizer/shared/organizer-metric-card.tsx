import type {
  ReactNode,
} from "react"

interface OrganizerMetricCardProps {
  label: string

  value: ReactNode

  subtitle?: string

  icon?: ReactNode
}

export function OrganizerMetricCard({
  label,
  value,
  subtitle,
  icon,
}: OrganizerMetricCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <div className="mt-2 text-3xl font-bold text-slate-950">
            {value}
          </div>

          {subtitle && (
            <p className="mt-2 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
            {icon}
          </div>
        )}
      </div>
    </article>
  )
}