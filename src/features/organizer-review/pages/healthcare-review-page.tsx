import {
  CalendarDays,
  CheckCircle2,
  FileWarning,
  HeartPulse,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  useMemo,
} from "react"

import {
  useParams,
} from "react-router-dom"

import {
  appConfig,
  getClientDetailsRoute,
} from "@/config/app-config"

import {
  ReviewActionBar,
  ReviewBreadcrumbs,
  ReviewEmptyState,
  ReviewErrorState,
  ReviewLoadingSkeleton,
  ReviewSectionHeader,
  ReviewStatusBadge,
} from "@/features/organizer-review/components"

import {
  useOrganizerReviewHealthcare,
} from "@/features/organizer-review/hooks"

import {
  OrganizerReviewLayout,
} from "@/features/organizer-review/layouts"

import type {
  OrganizerReviewHealthcareCoverage,
  OrganizerReviewHealthcareCoverageType,
  OrganizerReviewHealthcareDocumentType,
} from "@/features/organizer-review/types"

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

const coverageTypeLabels:
  Record<
    OrganizerReviewHealthcareCoverageType,
    string
  > = {
    employer:
      "Employer Coverage",

    marketplace:
      "Marketplace Coverage",

    medicare:
      "Medicare",

    medicaid:
      "Medicaid",

    cobra:
      "COBRA",

    private:
      "Private Insurance",

    military:
      "Military Coverage",

    other:
      "Other Coverage",
  }

const documentTypeLabels:
  Record<
    OrganizerReviewHealthcareDocumentType,
    string
  > = {
    "1095_a":
      "Form 1095-A",

    "1095_b":
      "Form 1095-B",

    "1095_c":
      "Form 1095-C",

    insurance_card:
      "Insurance Card",

    other:
      "Other Document",
  }

function parseTaxYear(
  value:
    string | undefined,
): number | null {
  if (!value) {
    return null
  }

  const parsed =
    Number(value)

  if (
    !Number.isInteger(
      parsed,
    ) ||
    parsed < 1900 ||
    parsed > 2200
  ) {
    return null
  }

  return parsed
}

function formatCoveragePeriod(
  coverage:
    OrganizerReviewHealthcareCoverage,
): string {
  if (
    coverage.isFullYearCoverage
  ) {
    return "Full Year"
  }

  const start =
    coverage.startMonth
      ? monthLabels[
          coverage.startMonth
        ]
      : "Unknown"

  const end =
    coverage.endMonth
      ? monthLabels[
          coverage.endMonth
        ]
      : "Unknown"

  return `${start} – ${end}`
}

function formatUpdatedAt(
  value: string,
): string {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
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
    date,
  )
}

function getReviewStatus(
  coverages:
    readonly OrganizerReviewHealthcareCoverage[],
) {
  if (
    coverages.length === 0
  ) {
    return "not_started" as const
  }

  if (
    coverages.some(
      (coverage) =>
        coverage.recordStatus ===
          "needs_review" ||
        (
          coverage.coverageType ===
            "marketplace" &&
          !coverage.documentReceived
        ),
    )
  ) {
    return "needs_attention" as const
  }

  if (
    coverages.every(
      (coverage) =>
        coverage.recordStatus ===
          "complete",
    )
  ) {
    return "complete" as const
  }

  return "in_progress" as const
}

interface HealthcareReviewCardProps {
  coverage:
    OrganizerReviewHealthcareCoverage
}

function HealthcareReviewCard({
  coverage,
}: HealthcareReviewCardProps) {
  const documentLabel =
    coverage.documentType
      ? documentTypeLabels[
          coverage.documentType
        ]
      : null

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-950">
              {
                coverage.providerName
              }
            </h2>

            {coverage.coverageType ===
              "marketplace" && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                Marketplace
              </span>
            )}
          </div>

          <p className="mt-1 text-sm font-medium text-blue-700">
            {
              coverageTypeLabels[
                coverage.coverageType
              ]
            }
          </p>
        </div>

        <ReviewStatusBadge
          status={
            coverage.recordStatus ===
            "complete"
              ? "complete"
              : coverage.recordStatus ===
                  "needs_review"
                ? "needs_attention"
                : "in_progress"
          }
          label={
            coverage.recordStatus ===
            "complete"
              ? "Complete"
              : coverage.recordStatus ===
                  "needs_review"
                ? "Needs Review"
                : "Draft"
          }
        />
      </div>

      <dl className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <UserRound
              className="h-4 w-4"
              aria-hidden="true"
            />

            Covered Person
          </dt>

          <dd className="mt-2 font-semibold text-slate-950">
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

          <dd className="mt-2 font-semibold text-slate-950">
            {
              formatCoveragePeriod(
                coverage,
              )
            }
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

          <dd className="mt-2 break-all font-semibold text-slate-950">
            {
              coverage.policyNumber ??
              "Not provided"
            }
          </dd>
        </div>

        <div
          className={[
            "rounded-xl border p-4",
            coverage.documentReceived
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50",
          ].join(" ")}
        >
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
            {coverage.documentReceived ? (
              <CheckCircle2
                className="h-4 w-4 text-emerald-700"
                aria-hidden="true"
              />
            ) : (
              <FileWarning
                className="h-4 w-4 text-amber-700"
                aria-hidden="true"
              />
            )}

            Supporting Document
          </dt>

          <dd className="mt-2 font-semibold text-slate-950">
            {coverage.documentReceived
              ? (
                  documentLabel ??
                  "Received"
                )
              : "Not received"}
          </dd>
        </div>
      </dl>

      {coverage.notes && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Client Notes
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {
              coverage.notes
            }
          </p>
        </div>
      )}

      <p className="mt-5 text-xs text-slate-500">
        Last updated{" "}
        {
          formatUpdatedAt(
            coverage.updatedAt,
          )
        }
      </p>
    </article>
  )
}

export function HealthcareReviewPage() {
  const {
    clientId:
      clientIdParameter,
    taxYear:
      taxYearParameter,
  } = useParams<{
    clientId: string
    taxYear: string
  }>()

  const clientId =
    clientIdParameter?.trim() ??
    ""

  const taxYear =
    parseTaxYear(
      taxYearParameter,
    )

  const {
    coverages,
    isLoading,
    errorMessage,
    refresh,
  } =
    useOrganizerReviewHealthcare(
      clientId,
      taxYear ?? 0,
    )

  const reviewStatus =
    useMemo(
      () =>
        getReviewStatus(
          coverages,
        ),
      [
        coverages,
      ],
    )

  const summary =
    useMemo(
      () => {
        const completedCount =
          coverages.filter(
            (coverage) =>
              coverage.recordStatus ===
              "complete",
          ).length

        const missingDocumentCount =
          coverages.filter(
            (coverage) =>
              !coverage.documentReceived,
          ).length

        const marketplaceCount =
          coverages.filter(
            (coverage) =>
              coverage.coverageType ===
              "marketplace",
          ).length

        return {
          completedCount,
          missingDocumentCount,
          marketplaceCount,
        }
      },
      [
        coverages,
      ],
    )

  const organizerReviewPath =
    clientId &&
    taxYear
      ? `/clients/${clientId}/organizer-review/${taxYear}`
      : appConfig.routes.clients

  const clientPath =
    clientId
      ? getClientDetailsRoute(
          clientId,
        )
      : appConfig.routes.clients

  const breadcrumbs = (
    <ReviewBreadcrumbs
      items={[
        {
          label:
            "Clients",
          href:
            appConfig.routes.clients,
        },
        {
          label:
            "Client Workspace",
          href:
            clientPath,
        },
        {
          label:
            "Organizer Review",
          href:
            organizerReviewPath,
        },
        {
          label:
            "Healthcare",
        },
      ]}
    />
  )

  if (
    !clientId ||
    taxYear === null
  ) {
    return (
      <OrganizerReviewLayout
        breadcrumbs={
          breadcrumbs
        }
        header={
          <ReviewSectionHeader
            eyebrow="Organizer Review"
            title="Healthcare Review"
            description="Review healthcare coverage entered by the client."
            icon={
              <HeartPulse
                className="h-6 w-6"
                aria-hidden="true"
              />
            }
            status="not_started"
          />
        }
      >
        <ReviewErrorState
          message="A valid client identifier and tax year are required."
          returnLabel="Return to Clients"
          returnHref={
            appConfig.routes.clients
          }
        />
      </OrganizerReviewLayout>
    )
  }

  if (isLoading) {
    return (
      <OrganizerReviewLayout
        breadcrumbs={
          breadcrumbs
        }
        header={
          <ReviewSectionHeader
            eyebrow="Organizer Review"
            title="Healthcare Review"
            description={`${taxYear} healthcare coverage and document review.`}
            icon={
              <HeartPulse
                className="h-6 w-6"
                aria-hidden="true"
              />
            }
            status="in_progress"
          />
        }
      >
        <ReviewLoadingSkeleton
          cardCount={3}
        />
      </OrganizerReviewLayout>
    )
  }

  if (errorMessage) {
    return (
      <OrganizerReviewLayout
        breadcrumbs={
          breadcrumbs
        }
        header={
          <ReviewSectionHeader
            eyebrow="Organizer Review"
            title="Healthcare Review"
            description={`${taxYear} healthcare coverage and document review.`}
            icon={
              <HeartPulse
                className="h-6 w-6"
                aria-hidden="true"
              />
            }
            status="needs_attention"
          />
        }
      >
        <ReviewErrorState
          message={
            errorMessage
          }
          returnLabel="Return to Organizer Review"
          returnHref={
            organizerReviewPath
          }
          onRetry={() => {
            void refresh()
          }}
        />
      </OrganizerReviewLayout>
    )
  }

  const headerMetadata = (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Coverage Records
        </dt>

        <dd className="mt-1 text-2xl font-bold text-slate-950">
          {
            coverages.length
          }
        </dd>
      </div>

      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Completed
        </dt>

        <dd className="mt-1 text-2xl font-bold text-emerald-700">
          {
            summary.completedCount
          }
        </dd>
      </div>

      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Missing Documents
        </dt>

        <dd className="mt-1 text-2xl font-bold text-amber-700">
          {
            summary.missingDocumentCount
          }
        </dd>
      </div>

      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Marketplace
        </dt>

        <dd className="mt-1 text-2xl font-bold text-violet-700">
          {
            summary.marketplaceCount
          }
        </dd>
      </div>
    </dl>
  )

  return (
    <OrganizerReviewLayout
      breadcrumbs={
        breadcrumbs
      }
      header={
        <ReviewSectionHeader
          eyebrow={`${taxYear} Tax Organizer`}
          title="Healthcare Review"
          description="Review healthcare coverage, coverage periods, supporting documents, and client notes."
          icon={
            <HeartPulse
              className="h-6 w-6"
              aria-hidden="true"
            />
          }
          status={
            reviewStatus
          }
          metadata={
            headerMetadata
          }
        />
      }
      actions={
        <ReviewActionBar
          actions={[
            {
              key:
                "refresh",
              label:
                "Refresh",
              icon:
                <RefreshCw
                  className="h-4 w-4"
                  aria-hidden="true"
                />,
              onClick: () => {
                void refresh()
              },
            },
            {
              key:
                "organizer-review",
              label:
                "Return to Organizer Review",
              href:
                organizerReviewPath,
              tone:
                "primary",
            },
            {
              key:
                "client",
              label:
                "Open Client Workspace",
              href:
                clientPath,
            },
          ]}
        />
      }
    >
      {coverages.length ===
      0 ? (
        <ReviewEmptyState
          title="No Healthcare Coverage"
          description="The client has not entered any healthcare coverage records for this tax year."
          actionLabel="Return to Organizer Review"
          actionHref={
            organizerReviewPath
          }
        />
      ) : (
        <div className="grid gap-5 2xl:grid-cols-2">
          {coverages.map(
            (coverage) => (
              <HealthcareReviewCard
                key={
                  coverage.coverageId
                }
                coverage={
                  coverage
                }
              />
            ),
          )}
        </div>
      )}
    </OrganizerReviewLayout>
  )
}
