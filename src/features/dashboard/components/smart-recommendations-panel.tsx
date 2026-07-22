import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  UserRoundCheck,
  UserRoundPlus,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import type {
  DashboardRecommendation,
} from "@/features/dashboard/types/dashboard.types"

type SmartRecommendationsPanelProps = {
  recommendations: DashboardRecommendation[]
}

function getPriorityStyles(
  priority: DashboardRecommendation["priority"],
) {
  switch (priority) {
    case "critical":
      return {
        badge:
          "border-red-200 bg-red-50 text-red-700",
        icon:
          "bg-red-100 text-red-700",
      }

    case "high":
      return {
        badge:
          "border-orange-200 bg-orange-50 text-orange-700",
        icon:
          "bg-orange-100 text-orange-700",
      }

    case "medium":
      return {
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon:
          "bg-amber-100 text-amber-700",
      }

    case "low":
    default:
      return {
        badge:
          "border-border bg-muted text-foreground",
        icon:
          "bg-primary text-primary-foreground",
      }
  }
}

function getRecommendationIcon(
  recommendationType:
    DashboardRecommendation["recommendationType"],
) {
  switch (recommendationType) {
    case "resolve_blocker":
      return AlertTriangle

    case "collect_documents":
      return FileWarning

    case "assign_preparer":
      return UserRoundPlus

    case "begin_preparation":
      return CheckCircle2

    case "assign_reviewer":
      return UserRoundCheck

    case "review_return":
      return ClipboardCheck

    case "due_date":
    default:
      return CalendarClock
  }
}

function formatPriority(
  priority: DashboardRecommendation["priority"],
) {
  return priority.charAt(0).toUpperCase()
    + priority.slice(1)
}

function formatDueDate(
  dueDate: string | null,
) {
  if (!dueDate) {
    return null
  }

  const parsedDate = new Date(
    `${dueDate}T00:00:00`,
  )

  if (Number.isNaN(parsedDate.getTime())) {
    return dueDate
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(parsedDate)
}

export function SmartRecommendationsPanel({
  recommendations,
}: SmartRecommendationsPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Smart Recommendations
          </p>

          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Recommended Next Actions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Prioritized actions based on return readiness,
            deadlines, assignments, and workflow blockers.
          </p>
        </div>

        <div className="w-fit rounded-full border border-border bg-muted/60 px-3 py-1 text-sm font-semibold text-foreground">
          {recommendations.length}
          {" "}
          {recommendations.length === 1
            ? "recommendation"
            : "recommendations"}
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2
              aria-hidden="true"
              className="h-6 w-6"
            />
          </div>

          <h3 className="mt-4 text-base font-semibold text-foreground">
            No immediate actions identified
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            The recommendation engine did not find any
            returns requiring immediate workflow action.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {recommendations.map(
            (recommendation) => {
              const styles =
                getPriorityStyles(
                  recommendation.priority,
                )

              const RecommendationIcon =
                getRecommendationIcon(
                  recommendation.recommendationType,
                )

              const formattedDueDate =
                formatDueDate(
                  recommendation.dueDate,
                )

              return (
                <article
                  className="px-6 py-5 transition hover:bg-muted/60"
                  key={recommendation.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
                      >
                        <RecommendationIcon
                          aria-hidden="true"
                          className="h-5 w-5"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {recommendation.title}
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}
                          >
                            {formatPriority(
                              recommendation.priority,
                            )}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-medium text-foreground">
                          {recommendation.clientName}
                          {" · "}
                          {recommendation.taxYear}
                          {" "}
                          {recommendation.returnType}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {recommendation.explanation}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                          <span>
                            Readiness:
                            {" "}
                            <strong className="font-semibold text-foreground">
                              {recommendation.readinessScore}
                              %
                            </strong>
                          </span>

                          {formattedDueDate ? (
                            <span>
                              Due:
                              {" "}
                              <strong className="font-semibold text-foreground">
                                {formattedDueDate}
                              </strong>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <Link
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                      to={recommendation.actionRoute}
                    >
                      Open Return

                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4"
                      />
                    </Link>
                  </div>
                </article>
              )
            },
          )}
        </div>
      )}
    </section>
  )
}