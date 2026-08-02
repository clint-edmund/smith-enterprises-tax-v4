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
          "rounded-2xl border p-6",
          health.isReadyForReview
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50",
        ].join(" ")}
      >
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

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-slate-950">
              {health.isReadyForReview
                ? "Organizer Ready for Review"
                : "Organizer Not Yet Ready for Review"}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
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

        <dl className="mt-6 grid gap-4 border-t border-slate-200/80 pt-6 sm:grid-cols-3">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-white/80 px-4 py-4 shadow-sm">
            <dt className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <ListChecks
                className="h-5 w-5 text-blue-700"
                aria-hidden="true"
              />

              In Progress
            </dt>

            <dd className="text-xl font-semibold text-slate-950">
              {
                health.inProgressSectionCount
              }
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-white/80 px-4 py-4 shadow-sm">
            <dt className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <AlertTriangle
                className="h-5 w-5 text-amber-700"
                aria-hidden="true"
              />

              Total Issues
            </dt>

            <dd className="text-xl font-semibold text-amber-700">
              {
                health.totalIssueCount
              }
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-white/80 px-4 py-4 shadow-sm">
            <dt className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <FileWarning
                className="h-5 w-5 text-red-700"
                aria-hidden="true"
              />

              Missing Documents
            </dt>

            <dd
              className={[
                "text-xl font-semibold",
                health.missingDocumentCount > 0
                  ? "text-red-700"
                  : "text-slate-950",
              ].join(" ")}
            >
              {
                health.missingDocumentCount
              }
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
