import {
  BadgeDollarSign,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  FileWarning,
  RefreshCw,
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
  ReviewMetricCard,
  ReviewRecordCard,
  ReviewSectionHeader,
  ReviewStatusBadge,
} from "@/features/organizer-review/components"

import {
  useOrganizerReviewIncome,
} from "@/features/organizer-review/hooks"

import {
  OrganizerReviewLayout,
} from "@/features/organizer-review/layouts"

import type {
  OrganizerReviewIncomeRecipientType,
  OrganizerReviewIncomeSource,
  OrganizerReviewIncomeType,
} from "@/features/organizer-review/types"

const incomeTypeLabels:
  Record<
    OrganizerReviewIncomeType,
    string
  > = {
    w2:
      "Form W-2",

    "1099_nec":
      "Form 1099-NEC",

    "1099_misc":
      "Form 1099-MISC",

    "1099_k":
      "Form 1099-K",

    "1099_int":
      "Form 1099-INT",

    "1099_div":
      "Form 1099-DIV",

    "1099_r":
      "Form 1099-R",

    ssa_1099:
      "Form SSA-1099",

    "1099_g":
      "Form 1099-G",

    other:
      "Other Income",
  }

const recipientLabels:
  Record<
    OrganizerReviewIncomeRecipientType,
    string
  > = {
    taxpayer:
      "Taxpayer",

    spouse:
      "Spouse",

    dependent:
      "Dependent",

    joint:
      "Joint",
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

function formatCurrency(
  value:
    number | null,
): string {
  if (value === null) {
    return "Not provided"
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",
      currency:
        "USD",
    },
  ).format(
    value,
  )
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
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    },
  ).format(
    date,
  )
}

function getReviewStatus(
  incomeSources:
    readonly OrganizerReviewIncomeSource[],
) {
  if (
    incomeSources.length === 0
  ) {
    return "not_started" as const
  }

  if (
    incomeSources.some(
      (source) =>
        source.recordStatus ===
          "needs_review" ||
        !source.documentReceived,
    )
  ) {
    return "needs_attention" as const
  }

  if (
    incomeSources.every(
      (source) =>
        source.recordStatus ===
          "complete",
    )
  ) {
    return "complete" as const
  }

  return "in_progress" as const
}

interface IncomeReviewCardProps {
  source:
    OrganizerReviewIncomeSource
}

function IncomeReviewCard({
  source,
}: IncomeReviewCardProps) {
  const status =
    source.recordStatus ===
    "complete"
      ? "complete"
      : source.recordStatus ===
          "needs_review"
        ? "needs_attention"
        : "in_progress"

  const statusLabel =
    source.recordStatus ===
    "complete"
      ? "Complete"
      : source.recordStatus ===
          "needs_review"
        ? "Needs Review"
        : "Draft"

  const footer = (
    <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Recipient:{" "}
        <strong className="font-semibold text-slate-700">
          {
            recipientLabels[
              source.recipientType
            ]
          }
        </strong>
      </span>

      <span>
        Last updated{" "}
        {
          formatUpdatedAt(
            source.updatedAt,
          )
        }
      </span>
    </div>
  )

  return (
    <ReviewRecordCard
      title={
        source.payerName
      }
      subtitle={
        incomeTypeLabels[
          source.incomeType
        ]
      }
      status={
        <ReviewStatusBadge
          status={
            status
          }
          label={
            statusLabel
          }
        />
      }
      footer={
        footer
      }
    >
      <dl className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <UserRound
              className="h-4 w-4"
              aria-hidden="true"
            />

            Recipient
          </dt>

          <dd className="mt-2 font-semibold text-slate-950">
            {
              recipientLabels[
                source.recipientType
              ]
            }
          </dd>
        </div>

        <div
          className={[
            "rounded-xl border p-4",
            source.documentReceived
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50",
          ].join(" ")}
        >
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
            {source.documentReceived ? (
              <FileCheck2
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
            {source.documentReceived
              ? "Received"
              : "Not received"}
          </dd>
        </div>
      </dl>

      {source.w2Details && (
        <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <BadgeDollarSign
              className="h-5 w-5 text-blue-700"
              aria-hidden="true"
            />

            <h3 className="font-semibold text-slate-950">
              W-2 Details
            </h3>
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Employer EIN
              </dt>

              <dd className="mt-1 font-medium text-slate-900">
                {
                  source.w2Details
                    .employerIdentificationNumber ??
                  "Not provided"
                }
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Wages
              </dt>

              <dd className="mt-1 font-medium text-slate-900">
                {
                  formatCurrency(
                    source.w2Details
                      .wages,
                  )
                }
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Federal Withholding
              </dt>

              <dd className="mt-1 font-medium text-slate-900">
                {
                  formatCurrency(
                    source.w2Details
                      .federalIncomeTaxWithheld,
                  )
                }
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Social Security Wages
              </dt>

              <dd className="mt-1 font-medium text-slate-900">
                {
                  formatCurrency(
                    source.w2Details
                      .socialSecurityWages,
                  )
                }
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Medicare Wages
              </dt>

              <dd className="mt-1 font-medium text-slate-900">
                {
                  formatCurrency(
                    source.w2Details
                      .medicareWages,
                  )
                }
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                State
              </dt>

              <dd className="mt-1 font-medium text-slate-900">
                {
                  source.w2Details
                    .stateCode ??
                  "Not provided"
                }
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                State Wages
              </dt>

              <dd className="mt-1 font-medium text-slate-900">
                {
                  formatCurrency(
                    source.w2Details
                      .stateWages,
                  )
                }
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                State Withholding
              </dt>

              <dd className="mt-1 font-medium text-slate-900">
                {
                  formatCurrency(
                    source.w2Details
                      .stateIncomeTaxWithheld,
                  )
                }
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Local Withholding
              </dt>

              <dd className="mt-1 font-medium text-slate-900">
                {
                  formatCurrency(
                    source.w2Details
                      .localIncomeTaxWithheld,
                  )
                }
              </dd>
            </div>
          </dl>
        </section>
      )}

      {source.notes && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Client Notes
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {
              source.notes
            }
          </p>
        </div>
      )}
    </ReviewRecordCard>
  )
}

export function IncomeReviewPage() {
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
    incomeSources,
    isLoading,
    errorMessage,
    refresh,
  } =
    useOrganizerReviewIncome(
      clientId,
      taxYear ?? 0,
    )

  const reviewStatus =
    useMemo(
      () =>
        getReviewStatus(
          incomeSources,
        ),
      [
        incomeSources,
      ],
    )

  const summary =
    useMemo(
      () => {
        const completedCount =
          incomeSources.filter(
            (source) =>
              source.recordStatus ===
              "complete",
          ).length

        const missingDocumentCount =
          incomeSources.filter(
            (source) =>
              !source.documentReceived,
          ).length

        const needsReviewCount =
          incomeSources.filter(
            (source) =>
              source.recordStatus ===
              "needs_review",
          ).length

        return {
          completedCount,
          missingDocumentCount,
          needsReviewCount,
        }
      },
      [
        incomeSources,
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
            "Income",
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
        clientId={clientId}
        taxYear={taxYear ?? undefined}
        currentSection="income"
        breadcrumbs={
          breadcrumbs
        }
        header={
          <ReviewSectionHeader
            eyebrow="Organizer Review"
            title="Income Review"
            description="Review income records entered by the client."
            icon={
              <CircleDollarSign
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
        clientId={clientId}
        taxYear={taxYear}
        currentSection="income"
        breadcrumbs={
          breadcrumbs
        }
        header={
          <ReviewSectionHeader
            eyebrow="Organizer Review"
            title="Income Review"
            description={`${taxYear} income record and document review.`}
            icon={
              <CircleDollarSign
                className="h-6 w-6"
                aria-hidden="true"
              />
            }
            status="in_progress"
          />
        }
      >
        <ReviewLoadingSkeleton
          cardCount={4}
        />
      </OrganizerReviewLayout>
    )
  }

  if (errorMessage) {
    return (
      <OrganizerReviewLayout
        clientId={clientId}
        taxYear={taxYear}
        currentSection="income"
        breadcrumbs={
          breadcrumbs
        }
        header={
          <ReviewSectionHeader
            eyebrow="Organizer Review"
            title="Income Review"
            description={`${taxYear} income record and document review.`}
            icon={
              <CircleDollarSign
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

  return (
    <OrganizerReviewLayout
      clientId={clientId}
      taxYear={taxYear}
      currentSection="income"
      breadcrumbs={
        breadcrumbs
      }
      header={
        <ReviewSectionHeader
          eyebrow={`${taxYear} Tax Organizer`}
          title="Income Review"
          description="Review income sources, supporting documents, W-2 values, and client notes."
          icon={
            <CircleDollarSign
              className="h-6 w-6"
              aria-hidden="true"
            />
          }
          status={
            reviewStatus
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
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ReviewMetricCard
          label="Income Records"
          value={
            incomeSources.length
          }
          icon={
            <CircleDollarSign
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone="primary"
        />

        <ReviewMetricCard
          label="Completed"
          value={
            summary.completedCount
          }
          icon={
            <CheckCircle2
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone="success"
        />

        <ReviewMetricCard
          label="Missing Documents"
          value={
            summary.missingDocumentCount
          }
          icon={
            <FileWarning
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone={
            summary.missingDocumentCount >
            0
              ? "warning"
              : "neutral"
          }
        />

        <ReviewMetricCard
          label="Needs Review"
          value={
            summary.needsReviewCount
          }
          icon={
            <BadgeDollarSign
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone={
            summary.needsReviewCount >
            0
              ? "danger"
              : "neutral"
          }
        />
      </section>

      {incomeSources.length ===
      0 ? (
        <ReviewEmptyState
          title="No Income Records"
          description="The client has not entered any income sources for this tax year."
          actionLabel="Return to Organizer Review"
          actionHref={
            organizerReviewPath
          }
        />
      ) : (
        <div className="grid gap-5 2xl:grid-cols-2">
          {incomeSources.map(
            (source) => (
              <IncomeReviewCard
                key={
                  source.incomeSourceId
                }
                source={
                  source
                }
              />
            ),
          )}
        </div>
      )}
    </OrganizerReviewLayout>
  )
}
