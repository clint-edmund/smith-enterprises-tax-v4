import {
  BadgeDollarSign,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  FileWarning,
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
  ReviewMetricCard,
  ReviewRecordCard,
  ReviewSectionHeader,
  ReviewStatusBadge,
} from "@/features/organizer-review/components"

import {
  IncomeStaffReviewPanel,
} from "@/features/organizer-review/components/income-staff-review-panel"

import {
  useIncomeReviewActions,
  useStaffIncomeReview,
} from "@/features/organizer-review/hooks"

import {
  OrganizerReviewLayout,
  OrganizerReviewShell,
} from "@/features/organizer-review/layouts"

import type {
  StaffIncomeReviewIncomeType,
  StaffIncomeReviewRecipientType,
  StaffIncomeReviewSource,
} from "@/features/organizer-review/types"

const incomeTypeLabels:
  Record<
    StaffIncomeReviewIncomeType,
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
    StaffIncomeReviewRecipientType,
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

function formatValue(
  value:
    string | null,
): string {
  return value?.trim() ||
    "Not provided"
}

function formatUpdatedAt(
  value:
    string | null,
): string {
  if (!value) {
    return "Not available"
  }

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
    readonly StaffIncomeReviewSource[],
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
        !source.documentReceived ||
        !source.hasRequiredPrimaryAmount,
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

interface DetailItemProps {
  label: string
  value: string
}

function DetailItem({
  label,
  value,
}: DetailItemProps) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 break-words font-medium text-slate-900">
        {value}
      </dd>
    </div>
  )
}

interface IncomeReviewCardProps {
  source:
    StaffIncomeReviewSource

  isActionRunning: (
    incomeSourceId: string,
    action?:
      | "mark_reviewed"
      | "needs_follow_up"
      | "save_notes"
      | "return_to_client",
  ) => boolean

  onMarkReviewed: (
    incomeSourceId: string,
  ) => Promise<void>

  onNeedsFollowUp: (
    incomeSourceId: string,
    internalNotes: string,
  ) => Promise<void>

  onSaveNotes: (
    incomeSourceId: string,
    internalNotes: string,
  ) => Promise<void>

  onReturnToClient: (
    incomeSourceId: string,
    internalNotes: string,
  ) => Promise<void>
}

function IncomeReviewCard({
  source,
  isActionRunning,
  onMarkReviewed,
  onNeedsFollowUp,
  onSaveNotes,
  onReturnToClient,
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

      {!source.hasRequiredPrimaryAmount && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <FileWarning
              className="h-4 w-4"
              aria-hidden="true"
            />

            Primary income amount is missing
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            The client has not provided the primary amount required for this income record.
          </p>
        </div>
      )}

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
            <DetailItem
              label="Employer EIN"
              value={
                formatValue(
                  source.w2Details
                    .employerIdentificationNumber,
                )
              }
            />

            <DetailItem
              label="Wages"
              value={
                formatCurrency(
                  source.w2Details
                    .wages,
                )
              }
            />

            <DetailItem
              label="Federal Withholding"
              value={
                formatCurrency(
                  source.w2Details
                    .federalIncomeTaxWithheld,
                )
              }
            />

            <DetailItem
              label="Social Security Wages"
              value={
                formatCurrency(
                  source.w2Details
                    .socialSecurityWages,
                )
              }
            />

            <DetailItem
              label="Social Security Tax"
              value={
                formatCurrency(
                  source.w2Details
                    .socialSecurityTaxWithheld,
                )
              }
            />

            <DetailItem
              label="Medicare Wages"
              value={
                formatCurrency(
                  source.w2Details
                    .medicareWages,
                )
              }
            />

            <DetailItem
              label="Medicare Tax"
              value={
                formatCurrency(
                  source.w2Details
                    .medicareTaxWithheld,
                )
              }
            />

            <DetailItem
              label="State"
              value={
                formatValue(
                  source.w2Details
                    .stateCode,
                )
              }
            />

            <DetailItem
              label="State Wages"
              value={
                formatCurrency(
                  source.w2Details
                    .stateWages,
                )
              }
            />

            <DetailItem
              label="State Withholding"
              value={
                formatCurrency(
                  source.w2Details
                    .stateIncomeTaxWithheld,
                )
              }
            />

            <DetailItem
              label="Local Wages"
              value={
                formatCurrency(
                  source.w2Details
                    .localWages,
                )
              }
            />

            <DetailItem
              label="Local Withholding"
              value={
                formatCurrency(
                  source.w2Details
                    .localIncomeTaxWithheld,
                )
              }
            />
          </dl>
        </section>
      )}

      {source.details1099Int && (
        <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <BadgeDollarSign
              className="h-5 w-5 text-blue-700"
              aria-hidden="true"
            />

            <h3 className="font-semibold text-slate-950">
              1099-INT Details
            </h3>
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DetailItem
              label="Payer TIN"
              value={
                formatValue(
                  source.details1099Int
                    .payerIdentificationNumber,
                )
              }
            />

            <DetailItem
              label="Interest Income"
              value={
                formatCurrency(
                  source.details1099Int
                    .interestIncome,
                )
              }
            />

            <DetailItem
              label="Federal Withholding"
              value={
                formatCurrency(
                  source.details1099Int
                    .federalIncomeTaxWithheld,
                )
              }
            />

            <DetailItem
              label="Early Withdrawal Penalty"
              value={
                formatCurrency(
                  source.details1099Int
                    .earlyWithdrawalPenalty,
                )
              }
            />

            <DetailItem
              label="U.S. Treasury Interest"
              value={
                formatCurrency(
                  source.details1099Int
                    .interestOnUsSavingsBondsAndTreasuryObligations,
                )
              }
            />

            <DetailItem
              label="Tax-Exempt Interest"
              value={
                formatCurrency(
                  source.details1099Int
                    .taxExemptInterest,
                )
              }
            />

            <DetailItem
              label="Private Activity Bond Interest"
              value={
                formatCurrency(
                  source.details1099Int
                    .specifiedPrivateActivityBondInterest,
                )
              }
            />

            <DetailItem
              label="Investment Expenses"
              value={
                formatCurrency(
                  source.details1099Int
                    .investmentExpenses,
                )
              }
            />

            <DetailItem
              label="Foreign Tax Paid"
              value={
                formatCurrency(
                  source.details1099Int
                    .foreignTaxPaid,
                )
              }
            />

            <DetailItem
              label="Foreign Country"
              value={
                formatValue(
                  source.details1099Int
                    .foreignCountryOrUsPossession,
                )
              }
            />

            <DetailItem
              label="Market Discount"
              value={
                formatCurrency(
                  source.details1099Int
                    .marketDiscount,
                )
              }
            />

            <DetailItem
              label="Bond Premium"
              value={
                formatCurrency(
                  source.details1099Int
                    .bondPremium,
                )
              }
            />

            <DetailItem
              label="Treasury Bond Premium"
              value={
                formatCurrency(
                  source.details1099Int
                    .bondPremiumOnTreasuryObligations,
                )
              }
            />

            <DetailItem
              label="Tax-Exempt Bond Premium"
              value={
                formatCurrency(
                  source.details1099Int
                    .bondPremiumOnTaxExemptBond,
                )
              }
            />

            <DetailItem
              label="State"
              value={
                formatValue(
                  source.details1099Int
                    .stateCode,
                )
              }
            />

            <DetailItem
              label="State Identification Number"
              value={
                formatValue(
                  source.details1099Int
                    .stateIdentificationNumber,
                )
              }
            />

            <DetailItem
              label="State Withholding"
              value={
                formatCurrency(
                  source.details1099Int
                    .stateTaxWithheld,
                )
              }
            />
          </dl>
        </section>
      )}

      {source.details1099Div && (
        <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <BadgeDollarSign
              className="h-5 w-5 text-blue-700"
              aria-hidden="true"
            />

            <h3 className="font-semibold text-slate-950">
              1099-DIV Details
            </h3>
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DetailItem
              label="Payer TIN"
              value={
                formatValue(
                  source.details1099Div
                    .payerIdentificationNumber,
                )
              }
            />

            <DetailItem
              label="Ordinary Dividends"
              value={
                formatCurrency(
                  source.details1099Div
                    .totalOrdinaryDividends,
                )
              }
            />

            <DetailItem
              label="Qualified Dividends"
              value={
                formatCurrency(
                  source.details1099Div
                    .qualifiedDividends,
                )
              }
            />

            <DetailItem
              label="Capital Gain Distributions"
              value={
                formatCurrency(
                  source.details1099Div
                    .totalCapitalGainDistributions,
                )
              }
            />

            <DetailItem
              label="Federal Withholding"
              value={
                formatCurrency(
                  source.details1099Div
                    .federalIncomeTaxWithheld,
                )
              }
            />

            <DetailItem
              label="Nondividend Distributions"
              value={
                formatCurrency(
                  source.details1099Div
                    .nondividendDistributions,
                )
              }
            />

            <DetailItem
              label="Section 199A Dividends"
              value={
                formatCurrency(
                  source.details1099Div
                    .section199aDividends,
                )
              }
            />

            <DetailItem
              label="Section 1250 Gain"
              value={
                formatCurrency(
                  source.details1099Div
                    .unrecapturedSection1250Gain,
                )
              }
            />

            <DetailItem
              label="Section 1202 Gain"
              value={
                formatCurrency(
                  source.details1099Div
                    .section1202Gain,
                )
              }
            />

            <DetailItem
              label="Collectibles 28% Gain"
              value={
                formatCurrency(
                  source.details1099Div
                    .collectibles28PercentRateGain,
                )
              }
            />

            <DetailItem
              label="Section 897 Ordinary Dividends"
              value={
                formatCurrency(
                  source.details1099Div
                    .section897OrdinaryDividends,
                )
              }
            />

            <DetailItem
              label="Section 897 Capital Gain"
              value={
                formatCurrency(
                  source.details1099Div
                    .section897CapitalGain,
                )
              }
            />

            <DetailItem
              label="Investment Expenses"
              value={
                formatCurrency(
                  source.details1099Div
                    .investmentExpenses,
                )
              }
            />

            <DetailItem
              label="Foreign Tax Paid"
              value={
                formatCurrency(
                  source.details1099Div
                    .foreignTaxPaid,
                )
              }
            />

            <DetailItem
              label="Foreign Country"
              value={
                formatValue(
                  source.details1099Div
                    .foreignCountryOrUsPossession,
                )
              }
            />

            <DetailItem
              label="Exempt-Interest Dividends"
              value={
                formatCurrency(
                  source.details1099Div
                    .exemptInterestDividends,
                )
              }
            />

            <DetailItem
              label="Private Activity Bond Dividends"
              value={
                formatCurrency(
                  source.details1099Div
                    .specifiedPrivateActivityBondInterestDividends,
                )
              }
            />

            <DetailItem
              label="State"
              value={
                formatValue(
                  source.details1099Div
                    .stateCode,
                )
              }
            />

            <DetailItem
              label="State Identification Number"
              value={
                formatValue(
                  source.details1099Div
                    .stateIdentificationNumber,
                )
              }
            />

            <DetailItem
              label="State Withholding"
              value={
                formatCurrency(
                  source.details1099Div
                    .stateTaxWithheld,
                )
              }
            />
          </dl>
        </section>
      )}

      <IncomeStaffReviewPanel
        source={
          source
        }
        isActionRunning={
          isActionRunning
        }
        onMarkReviewed={
          onMarkReviewed
        }
        onNeedsFollowUp={
          onNeedsFollowUp
        }
        onSaveNotes={
          onSaveNotes
        }
        onReturnToClient={
          onReturnToClient
        }
      />

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
    organizer,
    reviewer,
    summary,
    incomeSources,
    isLoading,
    isRefreshing,
    errorMessage,
    refresh,
  } =
    useStaffIncomeReview({
      clientId,
      taxYear:
        taxYear ?? 0,
    })

  const {
    errorMessage:
      actionErrorMessage,
    markReviewed,
    markNeedsFollowUp,
    saveNotes,
    returnToClient,
    isActionRunning,
    clearError:
      clearActionError,
  } =
    useIncomeReviewActions({
      onSuccess:
        async () => {
          await refresh()
        },
    })

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
        clientId={
          clientId
        }
        taxYear={
          taxYear ??
          undefined
        }
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
        clientId={
          clientId
        }
        taxYear={
          taxYear
        }
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
        clientId={
          clientId
        }
        taxYear={
          taxYear
        }
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
    <OrganizerReviewShell
      clientId={
        clientId
      }
      taxYear={
        taxYear
      }
      currentSection="income"
      breadcrumbs={
        breadcrumbs
      }
      header={
        <ReviewSectionHeader
          eyebrow={`${taxYear} Tax Organizer`}
          title="Income Review"
          description="Review income sources, supporting documents, W-2 values, 1099 values, and client notes."
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
                isRefreshing
                  ? "Refreshing..."
                  : "Refresh",
              icon:
                <RefreshCw
                  className={[
                    "h-4 w-4",
                    isRefreshing
                      ? "animate-spin"
                      : "",
                  ].join(" ")}
                  aria-hidden="true"
                />,
              onClick: () => {
                void refresh()
              },
              disabled:
                isRefreshing,
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
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <ReviewMetricCard
          label="Income Records"
          value={
            summary
              ?.incomeSourceCount ??
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
            summary
              ?.completedSourceCount ??
            0
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
          label="Ready"
          value={
            summary
              ?.readySourceCount ??
            0
          }
          icon={
            <ShieldCheck
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone="success"
        />

        <ReviewMetricCard
          label="Missing Documents"
          value={
            summary
              ?.missingDocumentCount ??
            0
          }
          icon={
            <FileWarning
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone={
            (
              summary
                ?.missingDocumentCount ??
              0
            ) > 0
              ? "warning"
              : "neutral"
          }
        />

        <ReviewMetricCard
          label="Needs Review"
          value={
            summary
              ?.needsReviewSourceCount ??
            0
          }
          icon={
            <BadgeDollarSign
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone={
            (
              summary
                ?.needsReviewSourceCount ??
              0
            ) > 0
              ? "danger"
              : "neutral"
          }
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Organizer
          </p>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Status"
              value={
                organizer?.status ??
                "Not available"
              }
            />

            <DetailItem
              label="Progress"
              value={
                organizer
                  ? `${organizer.progressPercentage}%`
                  : "Not available"
              }
            />

            <DetailItem
              label="Current Section"
              value={
                organizer?.currentSection ||
                "Not available"
              }
            />

            <DetailItem
              label="Last Saved"
              value={
                formatUpdatedAt(
                  organizer?.lastSavedAt ??
                  null,
                )
              }
            />
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Current Reviewer
          </p>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Staff Member"
              value={
                reviewer?.displayName ??
                "Not available"
              }
            />

            <DetailItem
              label="Role"
              value={
                reviewer?.role ??
                "Not available"
              }
            />

            <DetailItem
              label="Organizer Updated"
              value={
                formatUpdatedAt(
                  organizer?.updatedAt ??
                  null,
                )
              }
            />

            <DetailItem
              label="Review Access"
              value="Active staff session"
            />
          </dl>
        </article>
      </section>

      {actionErrorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex items-start justify-between gap-4">
            <p>
              {
                actionErrorMessage
              }
            </p>

            <button
              type="button"
              onClick={
                clearActionError
              }
              className="font-semibold text-red-900 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
                isActionRunning={
                  isActionRunning
                }
                onMarkReviewed={
                  async (
                    incomeSourceId:
                      string,
                  ) => {
                    await markReviewed(
                      incomeSourceId,
                    )
                  }
                }
                onNeedsFollowUp={
                  async (
                    incomeSourceId:
                      string,
                    internalNotes:
                      string,
                  ) => {
                    await markNeedsFollowUp(
                      incomeSourceId,
                      internalNotes,
                    )
                  }
                }
                onSaveNotes={
                  async (
                    incomeSourceId:
                      string,
                    internalNotes:
                      string,
                  ) => {
                    await saveNotes(
                      incomeSourceId,
                      internalNotes,
                    )
                  }
                }
                onReturnToClient={
                  async (
                    incomeSourceId:
                      string,
                    internalNotes:
                      string,
                  ) => {
                    await returnToClient(
                      incomeSourceId,
                      internalNotes,
                    )
                  }
                }
              />
            ),
          )}
        </div>
      )}
    </OrganizerReviewShell>
  )
}
