import type {
  ReactNode,
} from "react"

import type {
  LucideIcon,
} from "lucide-react"

import {
  AtlasCard,
} from "./atlas-card"

type AtlasKpiTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"

interface AtlasKpiCardProps {
  label: string
  value: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  tone?: AtlasKpiTone
  footer?: ReactNode
  className?: string
}

const toneClasses: Record<
  AtlasKpiTone,
  {
    icon: string
    accent: string
  }
> = {
  neutral: {
    icon:
      "border-slate-200 bg-slate-100 text-slate-700",
    accent:
      "text-slate-500",
  },
  info: {
    icon:
      "border-blue-200 bg-blue-50 text-blue-700",
    accent:
      "text-blue-700",
  },
  success: {
    icon:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    accent:
      "text-emerald-700",
  },
  warning: {
    icon:
      "border-amber-200 bg-amber-50 text-amber-700",
    accent:
      "text-amber-700",
  },
  danger: {
    icon:
      "border-red-200 bg-red-50 text-red-700",
    accent:
      "text-red-700",
  },
}

export function AtlasKpiCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "neutral",
  footer,
  className = "",
}: AtlasKpiCardProps) {
  const toneStyle =
    toneClasses[tone]

  return (
    <AtlasCard
      padding="md"
      className={className}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">
            {label}
          </p>

          <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </div>
        </div>

        {Icon ? (
          <div
            className={[
              "flex size-11 shrink-0 items-center justify-center rounded-xl border",
              toneStyle.icon,
            ].join(" ")}
          >
            <Icon
              className="size-5"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>

      {description ? (
        <div className="mt-4 text-sm leading-5 text-slate-500">
          {description}
        </div>
      ) : null}

      {footer ? (
        <div
          className={[
            "mt-4 border-t border-slate-100 pt-4 text-sm font-medium",
            toneStyle.accent,
          ].join(" ")}
        >
          {footer}
        </div>
      ) : null}
    </AtlasCard>
  )
}