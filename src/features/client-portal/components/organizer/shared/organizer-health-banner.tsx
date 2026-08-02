import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
} from "lucide-react"

import {
  organizerHealthMetadata,
} from "@/features/client-portal/constants/organizer-health.constants"

import type {
  OrganizerSectionHealth,
} from "@/features/client-portal/types/organizer-health.types"

import {
  OrganizerMetricCard,
} from "./organizer-metric-card"

interface OrganizerHealthBannerProps {
  health:
    OrganizerSectionHealth
}

const healthStyles = {
  not_started: {
    container:
      "border-slate-200 bg-slate-50",
    icon:
      "bg-slate-200 text-slate-700",
    badge:
      "bg-slate-200 text-slate-700",
  },

  in_progress: {
    container:
      "border-blue-200 bg-blue-50",
    icon:
      "bg-blue-100 text-blue-700",
    badge:
      "bg-blue-100 text-blue-700",
  },

  needs_attention: {
    container:
      "border-amber-200 bg-amber-50",
    icon:
      "bg-amber-100 text-amber-700",
    badge:
      "bg-amber-100 text-amber-800",
  },

  complete: {
    container:
      "border-emerald-200 bg-emerald-50",
    icon:
      "bg-emerald-100 text-emerald-700",
    badge:
      "bg-emerald-100 text-emerald-800",
  },
} as const

const healthIcons = {
  not_started:
    CircleDashed,

  in_progress:
    Clock3,

  needs_attention:
    AlertTriangle,

  complete:
    CheckCircle2,
} as const

function formatLastUpdated(
  value:
    string | null,
): string {
  if (!value) {
    return "Not yet updated"
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

export function OrganizerHealthBanner({
  health,
}: OrganizerHealthBannerProps) {
  const metadata =
    organizerHealthMetadata[
      health.healthLevel
    ]

  const styles =
    healthStyles[
      health.healthLevel
    ]

  const HealthIcon =
    healthIcons[
      health.healthLevel
    ]

  return (
    <section
      className={[
        "rounded-2xl border p-6",
        styles.container,
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            styles.icon,
          ].join(" ")}
        >
          <HealthIcon
            className="h-6 w-6"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-950">
              {health.sectionTitle} Health
            </h2>

            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                styles.badge,
              ].join(" ")}
            >
              {metadata.label}
            </span>
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            {metadata.description}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Last updated:{" "}
            {formatLastUpdated(
              health.lastUpdatedAt,
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <OrganizerMetricCard
          label="Progress"
          value={`${health.progressPercentage}%`}
        />

        <OrganizerMetricCard
          label="Records"
          value={health.recordCount}
        />

        <OrganizerMetricCard
          label="Completed"
          value={health.completedRecordCount}
        />

        <OrganizerMetricCard
          label="Issues"
          value={health.issueCount}
        />

        <OrganizerMetricCard
          label="Missing Docs"
          value={health.missingDocumentCount}
        />

        <OrganizerMetricCard
          label="Ready"
          value={
            health.isReadyForReview
              ? "Yes"
              : "No"
          }
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-700">
            Section completion
          </span>

          <span className="text-sm font-semibold text-slate-950">
            {health.progressPercentage}%
          </span>
        </div>

        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/80"
          role="progressbar"
          aria-label={`${health.sectionTitle} completion`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={
            health.progressPercentage
          }
        >
          <div
            className="h-full rounded-full bg-blue-700 transition-[width]"
            style={{
              width:
                `${health.progressPercentage}%`,
            }}
          />
        </div>
      </div>

      {health.blockingIssueCount > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <p>
            <span className="font-semibold">
              {health.blockingIssueCount}
            </span>{" "}
            blocking{" "}
            {health.blockingIssueCount === 1
              ? "issue must"
              : "issues must"}{" "}
            be resolved before this section is ready for review.
          </p>
        </div>
      )}
    </section>
  )
}
