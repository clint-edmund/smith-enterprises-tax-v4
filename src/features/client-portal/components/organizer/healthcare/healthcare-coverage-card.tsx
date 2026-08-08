import {
  CalendarDays,
  CheckCircle2,
  FileWarning,
  Pencil,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react"

import {
  healthcareCoverageMetadata,
  healthcareDocumentMetadata,
} from "@/features/client-portal/constants/healthcare.constants"

import type {
  OrganizerHealthcareCoverage,
} from "@/features/client-portal/types/organizer-healthcare.types"

interface HealthcareCoverageCardProps {
  coverage:
    OrganizerHealthcareCoverage

  onEdit: (
    coverage:
      OrganizerHealthcareCoverage,
  ) => void

  onDelete: (
    coverage:
      OrganizerHealthcareCoverage,
  ) => void
}

const monthLabels = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

const statusLabels = {
  draft:
    "Draft",

  complete:
    "Complete",

  needs_review:
    "Needs Review",
} as const

const statusClasses = {
  draft:
    "bg-amber-100 text-amber-800",

  complete:
    "bg-emerald-100 text-emerald-800",

  needs_review:
    "bg-red-100 text-red-800",
} as const

function formatCoveragePeriod(
  coverage:
    OrganizerHealthcareCoverage,
): string {
  if (
    coverage.isFullYearCoverage
  ) {
    return "Full Year"
  }

  const startLabel =
    coverage.startMonth
      ? monthLabels[
          coverage.startMonth
        ]
      : "Unknown"

  const endLabel =
    coverage.endMonth
      ? monthLabels[
          coverage.endMonth
        ]
      : "Unknown"

  return `${startLabel} – ${endLabel}`
}

function formatUpdatedAt(
  value: string,
): string {
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
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
    },
  ).format(
    parsedDate,
  )
}

export function HealthcareCoverageCard({
  coverage,
  onEdit,
  onDelete,
}: HealthcareCoverageCardProps) {
  const coverageMetadata =
    healthcareCoverageMetadata[
      coverage.coverageType
    ]

  const documentMetadata =
    coverage.documentType
      ? healthcareDocumentMetadata[
          coverage.documentType
        ]
      : null

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-950">
              {
                coverage.providerName
              }
            </h3>

            <span
              className={[
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                statusClasses[
                  coverage.recordStatus
                ],
              ].join(" ")}
            >
              {
                statusLabels[
                  coverage.recordStatus
                ]
              }
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-blue-700">
            {
              coverageMetadata.title
            }
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => {
              onEdit(
                coverage,
              )
            }}
            className="rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100"
            aria-label={`Edit ${coverage.providerName} coverage`}
          >
            <Pencil
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() => {
              onDelete(
                coverage,
              )
            }}
            className="rounded-lg border border-red-200 p-2 text-red-700 transition hover:bg-red-50"
            aria-label={`Delete ${coverage.providerName} coverage`}
          >
            <Trash2
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <UserRound
              className="h-4 w-4"
              aria-hidden="true"
            />

            Covered Person
          </dt>

          <dd className="mt-1 font-semibold text-slate-950">
            {
              coverage.coveredPersonName
            }
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <CalendarDays
              className="h-4 w-4"
              aria-hidden="true"
            />

            Coverage Period
          </dt>

          <dd className="mt-1 font-semibold text-slate-950">
            {
              formatCoveragePeriod(
                coverage,
              )
            }
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
            {coverage.documentReceived ? (
              <CheckCircle2
                className="h-4 w-4 text-emerald-600"
                aria-hidden="true"
              />
            ) : (
              <FileWarning
                className="h-4 w-4 text-amber-600"
                aria-hidden="true"
              />
            )}

            Document
          </dt>

          <dd className="mt-1 font-semibold text-slate-950">
            {coverage.documentReceived
              ? (
                  documentMetadata
                    ?.title ??
                  "Received"
                )
              : "Not Received"}
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <ShieldCheck
              className="h-4 w-4"
              aria-hidden="true"
            />

            Policy Number
          </dt>

          <dd className="mt-1 break-all font-semibold text-slate-950">
            {
              coverage.policyNumber ??
              "Not provided"
            }
          </dd>
        </div>
      </dl>

      {coverage.notes && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {
              coverage.notes
            }
          </p>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-500">
        Updated{" "}
        {
          formatUpdatedAt(
            coverage.updatedAt,
          )
        }
      </p>
    </article>
  )
}