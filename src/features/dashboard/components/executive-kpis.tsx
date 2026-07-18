import {
  CalendarDays,
  CalendarRange,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck2,
  TrendingUp,
} from "lucide-react"

import type { DashboardExecutiveMetrics } from "@/features/dashboard/types/dashboard.types"
import {
  formatCurrency,
  formatNumber,
} from "@/features/dashboard/utils/dashboard-formatters"

type ExecutiveKpisProps = {
  metrics: DashboardExecutiveMetrics
}

type ExecutiveKpiItem = {
  label: string
  value: string
  description: string
  icon: typeof CircleDollarSign
}

export function ExecutiveKpis({
  metrics,
}: ExecutiveKpisProps) {
  const items: ExecutiveKpiItem[] = [
    {
      label: "Projected Revenue",
      value: formatCurrency(
        metrics.projectedRevenue,
      ),
      description:
        "Expected preparation fees from returns that are not yet completed.",
      icon: CircleDollarSign,
    },
    {
      label: "Due Next 7 Days",
      value: formatNumber(
        metrics.returnsDueNext7Days,
      ),
      description:
        "Open returns with deadlines during the next seven days.",
      icon: CalendarDays,
    },
    {
      label: "Due Next 30 Days",
      value: formatNumber(
        metrics.returnsDueNext30Days,
      ),
      description:
        "Open returns with deadlines during the next thirty days.",
      icon: CalendarRange,
    },
    {
      label: "Completed This Week",
      value: formatNumber(
        metrics.completedThisWeek,
      ),
      description:
        "Returns completed since the beginning of the current week.",
      icon: FileCheck2,
    },
    {
      label: "Completed This Month",
      value: formatNumber(
        metrics.completedThisMonth,
      ),
      description:
        "Returns completed since the beginning of the current month.",
      icon: TrendingUp,
    },
    {
      label: "Review Queue",
      value: formatNumber(
        metrics.reviewQueue,
      ),
      description:
        "Returns that are currently in the review stage.",
      icon: ClipboardCheck,
    },
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
          Executive Metrics
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Operational Performance
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Monitor projected revenue, upcoming deadlines, production, and
          the current review queue.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <article
              key={item.label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    {item.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    {item.value}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                  <Icon className="size-5" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-5 text-slate-500">
                {item.description}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}