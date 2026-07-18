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
import { Link } from "react-router-dom"

type ExecutiveKpisProps = {
  metrics: DashboardExecutiveMetrics
}

type ExecutiveKpiItem = {
  label: string
  value: string
  description: string
  icon: typeof CircleDollarSign
  href?: string
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
      href: "/returns?deadline=next7",
    },
    {
      label: "Due Next 30 Days",
      value: formatNumber(
        metrics.returnsDueNext30Days,
      ),
      description:
        "Open returns with deadlines during the next thirty days.",
      icon: CalendarRange,
      href: "/returns?deadline=next30",
    },
    {
      label: "Completed This Week",
      value: formatNumber(
        metrics.completedThisWeek,
      ),
      description:
        "Returns completed since the beginning of the current week.",
      icon: FileCheck2,
      href: "/returns?workflow=completed&completedPeriod=week",
    },
    {
      label: "Completed This Month",
      value: formatNumber(
        metrics.completedThisMonth,
      ),
      description:
        "Returns completed since the beginning of the current month.",
      icon: TrendingUp,
      href: "/returns?workflow=completed&completedPeriod=month",
    },
    {
      label: "Review Queue",
      value: formatNumber(
        metrics.reviewQueue,
      ),
      description:
        "Returns that are currently in the review stage.",
      icon: ClipboardCheck,
      href: "/returns?workflow=review",
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

          const content = (
            <>
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

              {item.href ? (
                <p className="mt-4 text-sm font-semibold text-blue-700">
                  View matching returns →
                </p>
              ) : null}
            </>
          )

          if (item.href) {
            return (
              <Link
                key={item.label}
                to={item.href}
                className="block rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                {content}
              </Link>
            )
          }

          return (
            <article
              key={item.label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              {content}
            </article>
          )
        })}
      </div>
    </section>
  )
}