import type {
  ReactNode,
} from "react"

interface ReviewMetricCardProps {
  label: string

  value:
    string | number

  description?: string

  icon?: ReactNode

  tone?:
    | "neutral"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "violet"
}

const toneClasses = {
  neutral: {
    icon:
      "bg-slate-100 text-slate-700",

    value:
      "text-slate-950",
  },

  primary: {
    icon:
      "bg-blue-100 text-blue-700",

    value:
      "text-blue-800",
  },

  success: {
    icon:
      "bg-emerald-100 text-emerald-700",

    value:
      "text-emerald-800",
  },

  warning: {
    icon:
      "bg-amber-100 text-amber-700",

    value:
      "text-amber-800",
  },

  danger: {
    icon:
      "bg-red-100 text-red-700",

    value:
      "text-red-800",
  },

  violet: {
    icon:
      "bg-violet-100 text-violet-700",

    value:
      "text-violet-800",
  },
} as const

export function ReviewMetricCard({
  label,
  value,
  description,
  icon,
  tone = "neutral",
}: ReviewMetricCardProps) {
  const styles =
    toneClasses[
      tone
    ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>

          <p
            className={[
              "mt-3 text-3xl font-bold",
              styles.value,
            ].join(" ")}
          >
            {value}
          </p>
        </div>

        {icon && (
          <div
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              styles.icon,
            ].join(" ")}
          >
            {icon}
          </div>
        )}
      </div>

      {description && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {description}
        </p>
      )}
    </div>
  )
}