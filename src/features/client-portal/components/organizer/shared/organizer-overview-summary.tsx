import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  FileWarning,
  ListChecks,
} from "lucide-react"

import {
  OrganizerSummaryDashboard,
} from "./organizer-summary-dashboard"

import type {
  OrganizerHealthOverview,
} from "@/features/client-portal/types/organizer-health.types"

interface OrganizerOverviewSummaryProps {
  health:
    OrganizerHealthOverview
}

function formatLastUpdated(
  value:
    string | null,
): string {
  if (!value) {
    return "No activity yet"
  }

  const parsedDate =
    new Date(value)

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    parsedDate,
  )
}

export function OrganizerOverviewSummary({
  health,
}: OrganizerOverviewSummaryProps) {
  return (
    <div className="space-y-5">
      <OrganizerSummaryDashboard
        title={`${health.taxYear} Organizer Overview`}
        description="Review overall completion, outstanding issues, missing documents, and readiness for tax-preparer review."
        progressLabel="Overall organizer completion"
        progressPercentage={
          health.overallProgressPercentage
        }
        metrics={[
          {
            key:
              "sections",
            label:
              "Completed Sections",
            value: (
              <span>
                {
                  health.completedSectionCount
                }
                <span className="ml-1 text-base font-medium text-slate-500">
                  /{" "}
                  {
                    health.totalSectionCount
                  }
                </span>
              </span>
            ),
            description:
              "Sections marked complete",
          },
          {
            key:
              "attention",
            label:
              "Needs Attention",
            value:
              health.needsAttentionSectionCount,
            description:
              "Sections with warnings or incomplete records",
          },
          {
            key:
              "documents",
            label:
              "Missing Documents",
            value:
              health.missingDocumentCount,
            description:
              "Supporting documents still needed",
          },
          {
            key:
              "blocking",
            label:
              "Blocking Issues",
            value:
              health.blockingIssueCount,
            description:
              "Items preventing review readiness",
          },
        ]}
      />

      <section
        className={[
          "rounded-2xl border p-5",
          health.isReadyForReview
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50",
        ].join(" ")}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                health.isReadyForReview
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700",
              ].join(" ")}
            >
              {health.isReadyForReview ? (
                <CheckCircle2
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              ) : (
                <CircleX
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                {health.isReadyForReview
                  ? "Organizer Ready for Review"
                  : "Organizer Not Yet Ready for Review"}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                {health.isReadyForReview
                  ? "Every included section is complete and no blocking issues remain."
                  : "Complete the outstanding sections and resolve all blocking issues before submitting the organizer for tax-preparer review."}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Last updated:{" "}
                {formatLastUpdated(
                  health.lastUpdatedAt,
                )}
              </p>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3 lg:min-w-[470px]">
            <div className="rounded-xl bg-white/80 p-4 shadow-sm">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <ListChecks
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                In Progress
              </dt>

              <dd className="mt-2 text-2xl font-semibold text-slate-950">
                {
                  health.inProgressSectionCount
                }
              </dd>
            </div>

            <div className="rounded-xl bg-white/80 p-4 shadow-sm">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <AlertTriangle
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Total Issues
              </dt>

              <dd className="mt-2 text-2xl font-semibold text-slate-950">
                {
                  health.totalIssueCount
                }
              </dd>
            </div>

            <div className="rounded-xl bg-white/80 p-4 shadow-sm">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <FileWarning
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Missing Docs
              </dt>

              <dd className="mt-2 text-2xl font-semibold text-slate-950">
                {
                  health.missingDocumentCount
                }
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  )
}