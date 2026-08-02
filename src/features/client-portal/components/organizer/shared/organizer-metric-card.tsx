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
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      <div className="flex min-h-36 flex-col">
        <div className="flex min-h-10 items-start justify-between gap-2">
          <p className="min-w-0 break-words text-xs font-semibold uppercase leading-4 tracking-wide text-slate-500">
            {label}
          </p>

          {icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 text-3xl font-bold leading-none text-slate-950">
          {value}
        </div>

        {subtitle && (
          <p className="mt-auto pt-3 text-sm leading-5 text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
    </article>
  )
}
