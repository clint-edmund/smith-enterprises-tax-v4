import type {
  DashboardRiskLevel,
} from "@/features/dashboard/types/dashboard.types"

type RiskLevelBadgeProps = {
  level: DashboardRiskLevel
}

const riskLevelStyles: Record<
  DashboardRiskLevel,
  string
> = {
  critical:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",

  high:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300",

  medium:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",

  low:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
}

const riskLevelLabels: Record<
  DashboardRiskLevel,
  string
> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
}

export function RiskLevelBadge({
  level,
}: RiskLevelBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 shadow-sm",
        "text-xs font-bold uppercase tracking-wide",
        riskLevelStyles[level],
      ].join(" ")}
    >
      {riskLevelLabels[level]}
    </span>
  )
}