import type {
  ReactNode,
} from "react"

interface AtlasMetricProps {
  label: ReactNode
  value: ReactNode
  description?: ReactNode
  className?: string
}

export function AtlasMetric({
  label,
  value,
  description,
  className = "",
}: AtlasMetricProps) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-600">
          {label}
        </p>

        {description ? (
          <div className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 text-right text-lg font-bold text-slate-950">
        {value}
      </div>
    </div>
  )
}