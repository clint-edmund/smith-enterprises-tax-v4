import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleAlert,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"

import type {
  TaxReturnDetails,
} from "@/features/returns/types/return.types"

import type {
  ReadinessCheck,
  ReadinessCheckStatus,
  ReadinessIssue,
} from "./readiness.types"
import {
  useReturnReadiness,
} from "./use-return-readiness"

interface ReturnReadinessPanelProps {
  taxReturn: TaxReturnDetails
}

const checkStatusStyles: Record<
  ReadinessCheckStatus,
  string
> = {
  complete:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  attention:
    "border-amber-200 bg-amber-50 text-amber-800",
  blocked:
    "border-red-200 bg-red-50 text-red-800",
  not_applicable:
    "border-slate-200 bg-slate-50 text-slate-600",
}

function formatStatusLabel(
  status: ReadinessCheckStatus,
): string {
  switch (status) {
    case "complete":
      return "Complete"

    case "attention":
      return "Attention"

    case "blocked":
      return "Blocked"

    case "not_applicable":
      return "Not Applicable"
  }
}

function ReadinessCheckCard({
  check,
}: {
  check: ReadinessCheck
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">
            {check.label}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {check.description}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${checkStatusStyles[check.status]}`}
        >
          {formatStatusLabel(
            check.status,
          )}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Score</span>
          <span>{check.score}%</span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-700 transition-all"
            style={{
              width: `${check.score}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

function ReadinessIssueList({
  title,
  issues,
  type,
}: {
  title: string
  issues: ReadinessIssue[]
  type:
    | "blocker"
    | "warning"
    | "recommendation"
}) {
  if (issues.length === 0) {
    return null
  }

  const styles = {
    blocker:
      "border-red-200 bg-red-50 text-red-900",
    warning:
      "border-amber-200 bg-amber-50 text-amber-900",
    recommendation:
      "border-blue-200 bg-blue-50 text-blue-900",
  }

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>

      <div className="mt-3 space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className={`rounded-xl border p-4 ${styles[type]}`}
          >
            <p className="font-semibold">
              {issue.title}
            </p>

            <p className="mt-1 text-sm leading-6">
              {issue.description}
            </p>

            {issue.actionLabel ? (
              <p className="mt-2 text-xs font-semibold">
                Next step:{" "}
                {issue.actionLabel}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

export function ReturnReadinessPanel({
  taxReturn,
}: ReturnReadinessPanelProps) {
  const {
    readiness,
    isLoading,
    error,
    refresh,
  } = useReturnReadiness(
    taxReturn,
  )

  const statusConfiguration = {
    ready: {
      label: "Ready for Preparation",
      icon: ShieldCheck,
      classes:
        "border-emerald-200 bg-emerald-50 text-emerald-900",
    },
    attention: {
      label: "Needs Attention",
      icon: CircleAlert,
      classes:
        "border-amber-200 bg-amber-50 text-amber-900",
    },
    blocked: {
      label: "Not Ready",
      icon: Ban,
      classes:
        "border-red-200 bg-red-50 text-red-900",
    },
  }

  const configuration =
    statusConfiguration[
      readiness.status
    ]

  const StatusIcon =
    configuration.icon

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 w-52 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100" />
          <div className="mt-6 h-4 rounded bg-slate-100" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="h-32 rounded-xl bg-slate-100" />
            <div className="h-32 rounded-xl bg-slate-100" />
            <div className="h-32 rounded-xl bg-slate-100" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Return Intelligence
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Return Readiness
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Evaluate whether this return has the information,
              documents, assignments, and workflow status needed
              to begin preparation.
            </p>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              void refresh()
            }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${
                isLoading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh Readiness
          </button>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />

            <p>{error}</p>
          </div>
        ) : null}
      </div>

      <div className="p-6">
        <div
          className={`rounded-2xl border p-5 ${configuration.classes}`}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-white/70 p-3">
                <StatusIcon className="size-7" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
                  Current Readiness
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  {configuration.label}
                </h3>

                <p className="mt-2 text-sm">
                  Next action:{" "}
                  <span className="font-semibold">
                    {readiness.nextAction}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/70 p-4 text-center">
                <p className="text-2xl font-bold">
                  {readiness.score}%
                </p>

                <p className="mt-1 text-xs font-semibold uppercase">
                  Score
                </p>
              </div>

              <div className="rounded-xl bg-white/70 p-4 text-center">
                <p className="text-2xl font-bold">
                  {readiness.blockers.length}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase">
                  Blockers
                </p>
              </div>

              <div className="rounded-xl bg-white/70 p-4 text-center">
                <p className="text-2xl font-bold capitalize">
                  {readiness.confidence}
                </p>

                <p className="mt-1 text-xs font-semibold uppercase">
                  Confidence
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Overall readiness</span>
              <span>{readiness.score}%</span>
            </div>

            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-current transition-all"
                style={{
                  width: `${readiness.score}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {readiness.checks.map(
            (check) => (
              <ReadinessCheckCard
                key={check.key}
                check={check}
              />
            ),
          )}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <ReadinessIssueList
            title="Blocking Issues"
            issues={readiness.blockers}
            type="blocker"
          />

          <ReadinessIssueList
            title="Warnings"
            issues={readiness.warnings}
            type="warning"
          />

          <ReadinessIssueList
            title="Recommendations"
            issues={
              readiness.recommendations
            }
            type="recommendation"
          />
        </div>

        {readiness.blockers.length === 0 &&
        readiness.warnings.length === 0 &&
        readiness.recommendations.length === 0 ? (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />

            <div>
              <p className="font-semibold">
                No readiness issues found
              </p>

              <p className="mt-1 text-sm">
                This return currently satisfies all configured
                readiness requirements.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}