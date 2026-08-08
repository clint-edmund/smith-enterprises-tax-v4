import {
  Activity,
  CalendarClock,
  CircleAlert,
  ClipboardCheck,
  Gauge,
  ShieldAlert,
  UserRoundCheck,
} from "lucide-react"

import type {
  ReviewHealth,
  ReviewMetadata,
  ReviewPriority,
  ReviewStatus,
} from "@/features/organizer-review/types/review-metadata.types"

import {
  formatReviewDateTime,
  formatReviewHealth,
  formatReviewLastAction,
  formatReviewPriority,
  formatReviewStatus,
  formatReviewWorkflowStage,
} from "@/features/organizer-review/utils/review-metadata-utils"

interface ReviewStatusHeaderProps {
  metadata: ReviewMetadata
  isLoading?: boolean
}

function getStatusClasses(
  status: ReviewStatus,
): string {
  switch (status) {
    case "reviewed":
      return "border-emerald-200 bg-emerald-50 text-emerald-800"

    case "needs_follow_up":
      return "border-amber-200 bg-amber-50 text-amber-900"

    case "returned_to_client":
      return "border-red-200 bg-red-50 text-red-800"

    default:
      return "border-blue-200 bg-blue-50 text-blue-800"
  }
}

function getHealthClasses(
  health: ReviewHealth,
): string {
  switch (health) {
    case "healthy":
      return "border-emerald-200 bg-emerald-50 text-emerald-800"

    case "blocked":
      return "border-red-200 bg-red-50 text-red-800"

    default:
      return "border-amber-200 bg-amber-50 text-amber-900"
  }
}

function getPriorityClasses(
  priority: ReviewPriority,
): string {
  switch (priority) {
    case "critical":
      return "border-red-300 bg-red-100 text-red-900"

    case "high":
      return "border-orange-200 bg-orange-50 text-orange-900"

    case "low":
      return "border-slate-200 bg-slate-100 text-slate-700"

    default:
      return "border-blue-200 bg-blue-50 text-blue-800"
  }
}

function MetadataItem({
  label,
  value,
  icon:
    Icon,
}: {
  label: string
  value: string
  icon:
    typeof Activity
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon
          className="h-4 w-4"
          aria-hidden="true"
        />

        {label}
      </dt>

      <dd className="mt-2 text-sm font-semibold text-slate-950">
        {value}
      </dd>
    </div>
  )
}

export function ReviewStatusHeader({
  metadata,
  isLoading = false,
}: ReviewStatusHeaderProps) {
  if (isLoading) {
    return (
      <section
        className="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5"
        aria-label="Loading review status"
      >
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-3 h-8 w-48 rounded bg-slate-200" />

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-24 rounded-xl bg-white"
              />
            ),
          )}
        </div>
      </section>
    )
  }

  const reviewerName =
    metadata.assignedReviewerName ??
    metadata.reviewOwnerName ??
    "Unassigned"

  const checklistValue =
    metadata.checklist.totalItems >
    0
      ? `${metadata.checklist.completedItems} of ${metadata.checklist.totalItems} complete`
      : "Checklist not configured"

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Review Workspace
          </p>

          <h4 className="mt-1 text-lg font-semibold text-slate-950">
            Current Review Status
          </h4>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Current state, ownership, and readiness for this review item.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={[
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
              getStatusClasses(
                metadata.status,
              ),
            ].join(" ")}
          >
            {formatReviewStatus(
              metadata.status,
            )}
          </span>

          <span
            className={[
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
              getHealthClasses(
                metadata.health,
              ),
            ].join(" ")}
          >
            {formatReviewHealth(
              metadata.health,
            )}
          </span>

          <span
            className={[
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
              getPriorityClasses(
                metadata.priority,
              ),
            ].join(" ")}
          >
            {formatReviewPriority(
              metadata.priority,
            )} Priority
          </span>
        </div>
      </div>

      {metadata.healthReason && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <CircleAlert
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <div>
            <p className="font-semibold">
              Review health explanation
            </p>

            <p className="mt-1 leading-6">
              {metadata.healthReason}
            </p>
          </div>
        </div>
      )}

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetadataItem
          label="Assigned Reviewer"
          value={
            reviewerName
          }
          icon={
            UserRoundCheck
          }
        />

        <MetadataItem
          label="Review Started"
          value={
            formatReviewDateTime(
              metadata.reviewStartedAt,
            )
          }
          icon={
            CalendarClock
          }
        />

        <MetadataItem
          label="Last Updated"
          value={
            formatReviewDateTime(
              metadata.lastUpdatedAt,
            )
          }
          icon={
            Activity
          }
        />

        <MetadataItem
          label="Last Action"
          value={
            formatReviewLastAction(
              metadata.lastAction,
            )
          }
          icon={
            Gauge
          }
        />

        <MetadataItem
          label="Workflow Stage"
          value={
            formatReviewWorkflowStage(
              metadata.workflowStage,
            )
          }
          icon={
            ShieldAlert
          }
        />

        <MetadataItem
          label="Checklist"
          value={
            checklistValue
          }
          icon={
            ClipboardCheck
          }
        />

        <MetadataItem
          label="Checklist Progress"
          value={
            `${metadata.checklist.percentage}%`
          }
          icon={
            Gauge
          }
        />

        <MetadataItem
          label="Risk Level"
          value={
            formatReviewPriority(
              metadata.riskLevel,
            )
          }
          icon={
            ShieldAlert
          }
        />
      </dl>
    </section>
  )
}
