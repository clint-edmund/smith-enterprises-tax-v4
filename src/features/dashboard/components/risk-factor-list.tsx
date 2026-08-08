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
      <p className="text-sm text-stone-500 dark:text-stone-400">
        No risk factors were identified.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {factors.map((factor, index) => (
        <div
          key={`${factor.type}-${index}`}
          className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/60"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {factor.label}
              </p>

              <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                +{factor.points} points
              </span>
            </div>

            <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-400">
              {factor.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}