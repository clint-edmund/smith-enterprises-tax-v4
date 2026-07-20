import {
  AlertTriangle,
  ArrowRight,
  Ban,
  ClipboardCheck,
  FileCheck2,
  FolderClock,
  HeartPulse,
  UserRoundX,
} from "lucide-react"
import type {
  LucideIcon,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import type {
  DashboardReadinessMetrics,
} from "@/features/dashboard/types/dashboard.types"
import {
  formatNumber,
} from "@/features/dashboard/utils/dashboard-formatters"

type ReturnReadinessCenterProps = {
  metrics: DashboardReadinessMetrics
}

type ReadinessMetricItem = {
  label: string
  description: string
  value: number
  href: string
  icon: LucideIcon
  classes: string
  iconClasses: string
}

type Recommendation = {
  id: string
  title: string
  description: string
  href?: string
  severity: "success" | "info" | "warning" | "critical"
}

function getScoreClasses(score: number): string {
  if (score >= 90) {
    return "bg-emerald-100 text-emerald-800"
  }

  if (score >= 75) {
    return "bg-blue-100 text-blue-800"
  }

  if (score >= 60) {
    return "bg-amber-100 text-amber-800"
  }

  return "bg-red-100 text-red-800"
}

function getProgressClasses(score: number): string {
  if (score >= 90) {
    return "bg-emerald-600"
  }

  if (score >= 75) {
    return "bg-blue-600"
  }

  if (score >= 60) {
    return "bg-amber-500"
  }

  return "bg-red-600"
}

function getRecommendationClasses(
  severity: Recommendation["severity"],
): string {
  switch (severity) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900"

    case "info":
      return "border-blue-200 bg-blue-50 text-blue-900"

    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900"

    case "critical":
      return "border-red-200 bg-red-50 text-red-900"
  }
}

function buildRecommendations(
  metrics: DashboardReadinessMetrics,
): Recommendation[] {
  const recommendations: Recommendation[] = []

  if (metrics.needsDocuments > 0) {
    recommendations.push({
      id: "needs-documents",
      title: "Complete required documents",
      description: `${formatNumber(
        metrics.needsDocuments,
      )} active ${
        metrics.needsDocuments === 1
          ? "return needs"
          : "returns need"
      } document attention.`,
      href: "/returns?workflow=documents_pending",
      severity: "warning",
    })
  }

  if (metrics.missingPreparer > 0) {
    recommendations.push({
      id: "missing-preparer",
      title: "Assign preparers",
      description: `${formatNumber(
        metrics.missingPreparer,
      )} open ${
        metrics.missingPreparer === 1
          ? "return does"
          : "returns do"
      } not have an assigned preparer.`,
      href: "/returns?assignment=unassigned",
      severity: "warning",
    })
  }

  if (metrics.blockedReturns > 0) {
    recommendations.push({
      id: "blocked-returns",
      title: "Review blocked returns",
      description: `${formatNumber(
        metrics.blockedReturns,
      )} ${
        metrics.blockedReturns === 1
          ? "return is"
          : "returns are"
      } currently on hold.`,
      href: "/returns?workflow=on_hold",
      severity: "critical",
    })
  }

  if (metrics.overdueReturns > 0) {
    recommendations.push({
      id: "overdue-returns",
      title: "Address overdue returns",
      description: `${formatNumber(
        metrics.overdueReturns,
      )} active ${
        metrics.overdueReturns === 1
          ? "return is"
          : "returns are"
      } past the due date.`,
      href: "/returns?deadline=overdue",
      severity: "critical",
    })
  } else {
    recommendations.push({
      id: "no-overdue-returns",
      title: "No overdue returns",
      description:
        "All active returns are currently within their recorded deadlines.",
      severity: "success",
    })
  }

  if (metrics.readyForPreparation > 0) {
    recommendations.push({
      id: "ready-for-preparation",
      title: "Begin ready returns",
      description: `${formatNumber(
        metrics.readyForPreparation,
      )} ${
        metrics.readyForPreparation === 1
          ? "return is"
          : "returns are"
      } ready to begin preparation.`,
      href: "/returns?workflow=ready_for_preparation",
      severity: "info",
    })
  }

  if (metrics.readyForReview > 0) {
    recommendations.push({
      id: "ready-for-review",
      title: "Process the review queue",
      description: `${formatNumber(
        metrics.readyForReview,
      )} ${
        metrics.readyForReview === 1
          ? "return is"
          : "returns are"
      } currently in the review stage.`,
      href: "/returns?workflow=review",
      severity: "info",
    })
  }

  return recommendations.slice(0, 5)
}

function ScoreCard({
  label,
  score,
  description,
}: {
  label: string
  score: number
  description: string
}) {
  const normalizedScore = Math.max(
    0,
    Math.min(100, score),
  )

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {label}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${getScoreClasses(
            normalizedScore,
          )}`}
        >
          {normalizedScore}%
        </span>
      </div>

      <div
        aria-label={`${label}: ${normalizedScore}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedScore}
        className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
      >
        <div
          className={`h-full rounded-full transition-all ${getProgressClasses(
            normalizedScore,
          )}`}
          style={{
            width: `${normalizedScore}%`,
          }}
        />
      </div>
    </article>
  )
}

function ReadinessMetricCard({
  item,
}: {
  item: ReadinessMetricItem
}) {
  const Icon = item.icon

  return (
    <Link
      className={`group rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${item.classes}`}
      to={item.href}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">
            {item.label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {formatNumber(item.value)}
          </p>
        </div>

        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.iconClasses}`}
        >
          <Icon
            aria-hidden="true"
            className="size-5"
          />
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 opacity-80">
        {item.description}
      </p>

      <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
        View matching returns
        <ArrowRight
          aria-hidden="true"
          className="size-3.5 transition group-hover:translate-x-0.5"
        />
      </p>
    </Link>
  )
}

export function ReturnReadinessCenter({
  metrics,
}: ReturnReadinessCenterProps) {
  const metricItems: ReadinessMetricItem[] = [
    {
      label: "Ready for Preparation",
      description:
        "Readiness requirements are satisfied and preparation can begin.",
      value: metrics.readyForPreparation,
      href: "/returns?workflow=ready_for_preparation",
      icon: FileCheck2,
      classes:
        "border-emerald-200 bg-emerald-50 text-emerald-950",
      iconClasses:
        "bg-emerald-200 text-emerald-800",
    },
    {
      label: "Needs Documents",
      description:
        "Required-document checklists are missing or incomplete.",
      value: metrics.needsDocuments,
      href: "/returns?workflow=documents_pending",
      icon: FolderClock,
      classes:
        "border-amber-200 bg-amber-50 text-amber-950",
      iconClasses:
        "bg-amber-200 text-amber-800",
    },
    {
      label: "Missing Preparer",
      description:
        "Open returns that do not have an assigned preparer.",
      value: metrics.missingPreparer,
      href: "/returns?assignment=unassigned",
      icon: UserRoundX,
      classes:
        "border-orange-200 bg-orange-50 text-orange-950",
      iconClasses:
        "bg-orange-200 text-orange-800",
    },
    {
      label: "Ready for Review",
      description:
        "Returns currently waiting for or undergoing review.",
      value: metrics.readyForReview,
      href: "/returns?workflow=review",
      icon: ClipboardCheck,
      classes:
        "border-blue-200 bg-blue-50 text-blue-950",
      iconClasses:
        "bg-blue-200 text-blue-800",
    },
    {
      label: "Blocked",
      description:
        "Returns currently placed on hold and requiring attention.",
      value: metrics.blockedReturns,
      href: "/returns?workflow=on_hold",
      icon: Ban,
      classes:
        "border-red-200 bg-red-50 text-red-950",
      iconClasses:
        "bg-red-200 text-red-800",
    },
  ]

  const recommendations =
    buildRecommendations(metrics)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <HeartPulse
                aria-hidden="true"
                className="size-6"
              />
            </span>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
                Readiness Intelligence
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                Return Readiness Center
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                Identify what is preventing returns from moving forward and
                focus staff attention on the highest-priority work.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active Returns
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-950">
              {formatNumber(
                metrics.activeReturns,
              )}
            </p>

            <p className="text-xs text-slate-500">
              {formatNumber(
                metrics.readinessEligibleReturns,
              )} readiness eligible
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metricItems.map((item) => (
            <ReadinessMetricCard
              item={item}
              key={item.label}
            />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ScoreCard
            description="Average readiness across all active returns."
            label="Average Readiness Score"
            score={
              metrics.averageReadinessScore
            }
          />

          <ScoreCard
            description="Combined readiness, blocked-return, and deadline health."
            label="Office Health Score"
            score={
              metrics.officeHealthScore
            }
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle
                aria-hidden="true"
                className="size-5"
              />
            </span>

            <div>
              <h3 className="font-bold text-slate-950">
                Top Recommendations
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Recommended actions based on the current readiness metrics.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {recommendations.map(
              (recommendation) => {
                const content = (
                  <>
                    <p className="font-semibold">
                      {recommendation.title}
                    </p>

                    <p className="mt-1 text-sm leading-5 opacity-80">
                      {recommendation.description}
                    </p>

                    {recommendation.href ? (
                      <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
                        Open queue
                        <ArrowRight
                          aria-hidden="true"
                          className="size-3.5"
                        />
                      </p>
                    ) : null}
                  </>
                )

                const className =
                  `rounded-xl border p-4 ${getRecommendationClasses(
                    recommendation.severity,
                  )}`

                if (!recommendation.href) {
                  return (
                    <article
                      className={className}
                      key={recommendation.id}
                    >
                      {content}
                    </article>
                  )
                }

                return (
                  <Link
                    className={`${className} transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                    key={recommendation.id}
                    to={recommendation.href}
                  >
                    {content}
                  </Link>
                )
              },
            )}
          </div>
        </div>
      </div>
    </section>
  )
}