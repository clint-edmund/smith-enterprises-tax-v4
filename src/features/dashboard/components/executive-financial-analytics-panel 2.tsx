import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarDays,
  CircleDollarSign,
  FileCheck2,
  FileClock,
  Landmark,
  RefreshCw,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import type {
  ExecutiveFinancialAnalytics,
} from "@/features/dashboard/types/financial-analytics.types"
import {
  formatPaymentAmount,
  paymentMethodLabels,
} from "@/features/payments/utils/payment-formatters"

interface ExecutiveFinancialAnalyticsPanelProps {
  analytics: ExecutiveFinancialAnalytics
  errorMessage: string | null
  isRefreshing: boolean
  onRefresh: () => void
}

interface MetricCardProps {
  label: string
  value: string
  detail: string
  icon: typeof CircleDollarSign
  trend?: number | null
}

function calculateChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return current === 0
      ? 0
      : null
  }

  return (
    (current - previous) /
    Math.abs(previous)
  ) * 100
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  trend,
}: MetricCardProps) {
  const isPositive =
    trend !== undefined &&
    trend !== null &&
    trend >= 0

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {detail}
          </p>

          {trend !== undefined && (
            <div className="mt-3">
              {trend === null ? (
                <span className="text-xs font-semibold text-blue-700">
                  New activity
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    isPositive
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}

                  {Math.abs(trend).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>

        <span className="rounded-lg bg-white p-2.5 text-blue-700 shadow-sm">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  )
}

export function ExecutiveFinancialAnalyticsPanel({
  analytics,
  errorMessage,
  isRefreshing,
  onRefresh,
}: ExecutiveFinancialAnalyticsPanelProps) {
  const {
    periods,
    collection,
    paymentMethods,
    preparers,
    dailySnapshot,
  } = analytics

  const sevenDayChange =
    calculateChange(
      periods.last7DaysRevenue,
      periods.previous7DaysRevenue,
    )

  const todayChange =
    calculateChange(
      periods.todayRevenue,
      periods.yesterdayRevenue,
    )

  const methodTotal =
    paymentMethods.reduce(
      (total, item) =>
        total + item.totalAmount,
      0,
    )

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
            <TrendingUp
              className="size-5"
              aria-hidden="true"
            />
          </span>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Executive Financial Analytics
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Compare collection periods, review payment mix,
              monitor collection efficiency, and see preparer
              financial performance.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isRefreshing}
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>

          <Link
            to="/payments"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Payment Details
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-900">
            Executive analytics unavailable
          </p>
          <p className="mt-1 text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Revenue Today"
              value={formatPaymentAmount(
                periods.todayRevenue,
              )}
              detail={`${periods.todayPaymentCount} payment${
                periods.todayPaymentCount === 1
                  ? ""
                  : "s"
              } received`}
              icon={CircleDollarSign}
              trend={todayChange}
            />

            <MetricCard
              label="Last 7 Days"
              value={formatPaymentAmount(
                periods.last7DaysRevenue,
              )}
              detail="Compared with the previous seven days"
              icon={CalendarDays}
              trend={sevenDayChange}
            />

            <MetricCard
              label="Last 30 Days"
              value={formatPaymentAmount(
                periods.last30DaysRevenue,
              )}
              detail="Non-voided payments received"
              icon={Landmark}
            />

            <MetricCard
              label="Year to Date"
              value={formatPaymentAmount(
                periods.yearToDateRevenue,
              )}
              detail={`${formatPaymentAmount(
                periods.averageDailyRevenue,
              )} average per calendar day`}
              icon={BadgeDollarSign}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <WalletCards className="mt-0.5 size-5 text-emerald-700" />
                <div>
                  <h3 className="font-bold text-slate-950">
                    Collection Efficiency
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Fees, collections, and open receivables.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Total Fees"
                  value={formatPaymentAmount(
                    collection.totalFees,
                  )}
                  detail="Net preparation fees"
                  icon={CircleDollarSign}
                />
                <MetricCard
                  label="Collected"
                  value={formatPaymentAmount(
                    collection.totalCollected,
                  )}
                  detail={`${collection.collectionRate.toFixed(
                    1,
                  )}% collection rate`}
                  icon={BadgeDollarSign}
                />
                <MetricCard
                  label="Outstanding"
                  value={formatPaymentAmount(
                    collection.outstandingReceivables,
                  )}
                  detail={`${collection.returnsAwaitingPayment} return${
                    collection.returnsAwaitingPayment === 1
                      ? ""
                      : "s"
                  } awaiting payment`}
                  icon={WalletCards}
                />
                <MetricCard
                  label="Collection Rate"
                  value={`${collection.collectionRate.toFixed(
                    1,
                  )}%`}
                  detail="Collected divided by total net fees"
                  icon={TrendingUp}
                />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <CircleDollarSign className="mt-0.5 size-5 text-blue-700" />
                <div>
                  <h3 className="font-bold text-slate-950">
                    Payment Method Breakdown
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Share of non-voided collections.
                  </p>
                </div>
              </div>

              {paymentMethods.length === 0 ? (
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  No payment-method activity is available.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {paymentMethods.map((item) => {
                    const percentage =
                      methodTotal <= 0
                        ? 0
                        : (
                            item.totalAmount /
                            methodTotal
                          ) * 100

                    return (
                      <div key={item.paymentMethod}>
                        <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-700">
                            {
                              paymentMethodLabels[
                                item.paymentMethod
                              ]
                            }
                          </span>

                          <span className="text-right font-semibold text-slate-950">
                            {formatPaymentAmount(
                              item.totalAmount,
                            )}
                            <span className="ml-2 text-xs font-normal text-slate-500">
                              {item.paymentCount} · {percentage.toFixed(1)}%
                            </span>
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-700"
                            style={{
                              width: `${Math.max(
                                percentage,
                                percentage > 0
                                  ? 2
                                  : 0,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-5 text-violet-700" />
                <div>
                  <h3 className="font-bold text-slate-950">
                    Preparer Revenue Leaderboard
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Ranked by collected revenue.
                  </p>
                </div>
              </div>

              {preparers.length === 0 ? (
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  No assigned-preparer financial data is available.
                </p>
              ) : (
                <div className="mt-5 divide-y divide-slate-100">
                  {preparers.map((preparer, index) => (
                    <article
                      key={preparer.preparerId}
                      className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[2rem_1fr_auto]"
                    >
                      <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                        {index + 1}
                      </span>

                      <div>
                        <p className="font-semibold text-slate-950">
                          {preparer.preparerName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {preparer.returnCount} assigned return${
                            preparer.returnCount === 1
                              ? ""
                              : "s"
                          } · {preparer.collectionRate.toFixed(1)}% collected
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="font-bold text-slate-950">
                          {formatPaymentAmount(
                            preparer.totalCollected,
                          )}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatPaymentAmount(
                            preparer.outstandingReceivables,
                          )} outstanding
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <FileCheck2 className="mt-0.5 size-5 text-emerald-700" />
                <div>
                  <h3 className="font-bold text-slate-950">
                    Daily Office Snapshot
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Today&apos;s operational and financial activity.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Returns completed",
                    value:
                      dailySnapshot.returnsCompletedToday,
                    icon: FileCheck2,
                  },
                  {
                    label: "Payments received",
                    value:
                      dailySnapshot.paymentsReceivedToday,
                    icon: CircleDollarSign,
                  },
                  {
                    label: "Revenue received",
                    value: formatPaymentAmount(
                      dailySnapshot.revenueToday,
                    ),
                    icon: BadgeDollarSign,
                  },
                  {
                    label: "Awaiting payment",
                    value:
                      dailySnapshot.returnsAwaitingPayment,
                    icon: FileClock,
                  },
                  {
                    label: "Returns filed",
                    value:
                      dailySnapshot.returnsFiledToday,
                    icon: Landmark,
                  },
                  {
                    label: "New clients",
                    value:
                      dailySnapshot.newClientsToday,
                    icon: UserPlus,
                  },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <article
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                    >
                      <span className="rounded-lg bg-white p-2 text-blue-700 shadow-sm">
                        <Icon className="size-4" />
                      </span>

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-1 font-bold text-slate-950">
                          {item.value}
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  )
}
