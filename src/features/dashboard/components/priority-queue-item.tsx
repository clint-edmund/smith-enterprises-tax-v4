import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react"
import {
  useState,
} from "react"
import {
  Link,
} from "react-router-dom"

import {
  RiskFactorList,
} from "@/features/dashboard/components/risk-factor-list"
import {
  getClientDetailsRoute,
} from "@/config/app-config"
import {
  RiskLevelBadge,
} from "@/features/dashboard/components/risk-level-badge"
import {
  RiskScoreIndicator,
} from "@/features/dashboard/components/risk-score-indicator"
import type {
  DashboardPriorityItem,
} from "@/features/dashboard/types/dashboard.types"

type PriorityQueueItemProps = {
  item: DashboardPriorityItem
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Not set"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Not set"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date)
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(value)
}

function getDueDateLabel(
  daysUntilDue: number | null,
  dueDate: string | null,
): string {
  if (daysUntilDue === null) {
    return formatDate(dueDate)
  }

  if (daysUntilDue < 0) {
    const overdueDays =
      Math.abs(daysUntilDue)

    return `${overdueDays} ${
      overdueDays === 1 ? "day" : "days"
    } overdue`
  }

  if (daysUntilDue === 0) {
    return "Due today"
  }

  if (daysUntilDue === 1) {
    return "Due tomorrow"
  }

  return `Due in ${daysUntilDue} days`
}

function getActivityLabel(
  daysSinceActivity: number | null,
): string {
  if (daysSinceActivity === null) {
    return "No recent activity"
  }

  if (daysSinceActivity === 0) {
    return "Activity today"
  }

  if (daysSinceActivity === 1) {
    return "Last activity yesterday"
  }

  return `Last activity ${daysSinceActivity} days ago`
}

export function PriorityQueueItem({
  item,
}: PriorityQueueItemProps) {
  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false)

  const [
    isQuickActionsOpen,
    setIsQuickActionsOpen,
  ] = useState(false)

  const dueDateLabel =
    getDueDateLabel(
      item.daysUntilDue,
      item.dueDate,
    )

  const activityLabel =
    getActivityLabel(
      item.daysSinceActivity,
    )

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <RiskScoreIndicator
          score={item.riskScore}
          level={item.riskLevel}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-slate-950 dark:text-slate-50">
                  {item.clientName}
                </h3>

                <RiskLevelBadge
                  level={item.riskLevel}
                />
              </div>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {item.taxYear}{" "}
                {item.returnType}
              </p>

              <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.recommendedAction}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                to={getClientDetailsRoute(
                  item.clientId,
                )}
                className={[
                  "inline-flex items-center justify-center rounded-md",
                  "border border-slate-300 bg-white px-3 py-2",
                  "text-sm font-semibold text-slate-700",
                  "transition hover:bg-slate-100",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-slate-400",
                  "dark:border-slate-700",
                  "dark:bg-slate-900",
                  "dark:text-slate-200",
                  "dark:hover:bg-slate-800",
                ].join(" ")}
              >
                Open Client
              </Link>

              <Link
                to={item.actionRoute}
                className={[
                  "inline-flex items-center justify-center gap-2",
                  "rounded-md bg-slate-900 px-3 py-2",
                  "text-sm font-semibold text-white",
                  "transition hover:bg-slate-700",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-slate-400",
                  "dark:bg-slate-100",
                  "dark:text-slate-900",
                  "dark:hover:bg-slate-300",
                ].join(" ")}
              >
                Open Return

                <ExternalLink
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setIsQuickActionsOpen(
                      (currentValue) =>
                        !currentValue,
                    )
                  }
                  className={[
                    "inline-flex h-10 w-10 items-center justify-center",
                    "rounded-md border border-slate-300 bg-white",
                    "text-slate-700 transition hover:bg-slate-100",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-slate-400",
                    "dark:border-slate-700",
                    "dark:bg-slate-900",
                    "dark:text-slate-200",
                    "dark:hover:bg-slate-800",
                  ].join(" ")}
                  aria-expanded={isQuickActionsOpen}
                  aria-haspopup="menu"
                  aria-label={`Quick actions for ${item.clientName}`}
                  title="Quick actions"
                >
                  <MoreHorizontal
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </button>

                {isQuickActionsOpen ? (
                  <div
                    role="menu"
                    className={[
                      "absolute right-0 z-20 mt-2 w-64",
                      "rounded-lg border border-slate-200",
                      "bg-white p-2 shadow-lg",
                      "dark:border-slate-700",
                      "dark:bg-slate-900",
                    ].join(" ")}
                  >
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Quick Actions
                    </p>

                    {[
                      "Assign Preparer",
                      "Assign Reviewer",
                      "Mark Documents Received",
                      "Request Documents",
                      "Add Internal Note",
                      "Record Payment",
                    ].map((actionLabel) => (
                      <button
                        key={actionLabel}
                        type="button"
                        disabled
                        role="menuitem"
                        title={`${actionLabel} will be available in a later phase.`}
                        className={[
                          "flex w-full items-center rounded-md",
                          "px-3 py-2 text-left text-sm",
                          "font-medium text-slate-400",
                          "cursor-not-allowed",
                          "dark:text-slate-600",
                        ].join(" ")}
                      >
                        {actionLabel}
                      </button>
                    ))}

                    <div className="my-2 border-t border-slate-200 dark:border-slate-700" />

                    <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                      Workflow actions will be enabled in upcoming phases.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Readiness
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {Math.round(
                  item.readinessScore,
                )}
                %
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Due Date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {dueDateLabel}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Outstanding
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(
                  item.outstandingBalance,
                )}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Activity
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {activityLabel}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Preparer:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">
                {item.assignedPreparerName ??
                  "Unassigned"}
              </span>
            </div>

            <div>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Reviewer:
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">
                {item.assignedReviewerName ??
                  "Unassigned"}
              </span>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() =>
                setIsExpanded(
                  (currentValue) =>
                    !currentValue,
                )
              }
              className={[
                "inline-flex items-center gap-2",
                "text-sm font-semibold text-slate-700",
                "transition hover:text-slate-950",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-slate-400",
                "dark:text-slate-300 dark:hover:text-white",
              ].join(" ")}
              aria-expanded={isExpanded}
            >
              {isExpanded
                ? "Hide risk factors"
                : `View risk factors (${item.riskFactors.length})`}

              {isExpanded ? (
                <ChevronUp
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              ) : (
                <ChevronDown
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}
            </button>

            {isExpanded ? (
              <div className="mt-4">
                <RiskFactorList
                  factors={
                    item.riskFactors
                  }
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}