import type {
  ReactNode,
} from "react"

type AtlasStatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"

interface AtlasStatusPillProps {
  children: ReactNode
  tone?: AtlasStatusTone
  className?: string
}

const toneClasses: Record<
  AtlasStatusTone,
  string
> = {
  neutral:
    "bg-slate-100 text-slate-700 ring-slate-200",
  info:
    "bg-blue-50 text-blue-700 ring-blue-200",
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning:
    "bg-amber-50 text-amber-800 ring-amber-200",
  danger:
    "bg-red-50 text-red-700 ring-red-200",
}

export function AtlasStatusPill({
  children,
  tone = "neutral",
  className = "",
}: AtlasStatusPillProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        toneClasses[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  )
}