import type {
  DashboardRiskLevel,
} from "@/features/dashboard/types/dashboard.types"

type RiskScoreIndicatorProps = {
  score: number
  level: DashboardRiskLevel
}

const riskScoreStyles: Record<
  DashboardRiskLevel,
  string
> = {
  critical:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300",

  high:
    "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/40 dark:text-orange-300",

  medium:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",

  low:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300",
}

function normalizeRiskScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0
  }

  return Math.min(
    100,
    Math.max(0, Math.round(score)),
  )
}

export function RiskScoreIndicator({
  score,
  level,
}: RiskScoreIndicatorProps) {
  const normalizedScore =
    normalizeRiskScore(score)

  return (
    <div
      className={[
        "flex h-16 w-16 shrink-0 flex-col items-center justify-center shadow-sm",
        "rounded-2xl border-2",
        riskScoreStyles[level],
      ].join(" ")}
      aria-label={`Risk score ${normalizedScore} out of 100`}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
        Risk
      </span>

      <span className="mt-0.5 text-xl font-extrabold leading-none">
        {normalizedScore}
      </span>
    </div>
  )
}