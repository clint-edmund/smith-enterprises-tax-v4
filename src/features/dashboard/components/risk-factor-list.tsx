import {
  AlertTriangle,
} from "lucide-react"

import type {
  DashboardRiskFactor,
} from "@/features/dashboard/types/dashboard.types"

type RiskFactorListProps = {
  factors: DashboardRiskFactor[]
}

export function RiskFactorList({
  factors,
}: RiskFactorListProps) {
  if (factors.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No risk factors were identified.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {factors.map((factor, index) => (
        <div
          key={`${factor.type}-${index}`}
          className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {factor.label}
              </p>

              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                +{factor.points} points
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {factor.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}