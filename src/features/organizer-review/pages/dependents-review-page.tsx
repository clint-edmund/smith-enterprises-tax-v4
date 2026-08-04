import {
  Baby,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  Home,
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
  useOrganizerReviewDependents,
} from "@/features/organizer-review/hooks"

import {
  OrganizerReviewLayout,
  OrganizerReviewShell,
} from "@/features/organizer-review/layouts"

import type {
  OrganizerReviewDependent,
  OrganizerReviewDependentRelationship,
} from "@/features/organizer-review/types"

const relationshipLabels:
  Record<
    OrganizerReviewDependentRelationship,
    string
  > = {
    son:
      "Son",

    daughter:
      "Daughter",

    stepson:
      "Stepson",

    stepdaughter:
      "Stepdaughter",

    foster_child:
      "Foster Child",

    brother:
      "Brother",

    sister:
      "Sister",

    stepbrother:
      "Stepbrother",

    stepsister:
      "Stepsister",

    half_brother:
      "Half Brother",

    half_sister:
      "Half Sister",

    grandchild:
      "Grandchild",

    parent:
      "Parent",

    grandparent:
      "Grandparent",

    niece:
      "Niece",

    nephew:
      "Nephew",

    other_relative:
      "Other Relative",

    non_relative:
      "Non-relative",
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

function formatDate(
  value: string,
): string {
  const date =
    new Date(
      `${value}T00:00:00`,
    )

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
    },
  ).format(
    date,
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

function getFullName(
  dependent:
    OrganizerReviewDependent,
): string {
  return [
    dependent.firstName,
    dependent.middleName,
    dependent.lastName,
    dependent.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

function requiresReview(
  dependent:
    OrganizerReviewDependent,
): boolean {
  return (
    dependent.claimedByAnotherTaxpayer ||
    !dependent.usCitizenOrResident ||
    (
      !dependent.livedWithTaxpayerAllYear &&
      dependent.monthsLivedWithTaxpayer <
        12
    )
  )
}

function getReviewStatus(
  dependents:
    readonly OrganizerReviewDependent[],
) {
  if (
    dependents.length === 0
  ) {
    return "not_started" as const
  }

  if (
    dependents.some(
      requiresReview,
    )
  ) {
    return "needs_attention" as const
  }

  return "complete" as const
}

interface DependentReviewCardProps {
  dependent:
    OrganizerReviewDependent
}

function DependentReviewCard({
  dependent,
}: DependentReviewCardProps) {
  const needsReview =
    requiresReview(
      dependent,
    )

  const footer = (
    <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Relationship:{" "}
        <strong className="font-semibold text-slate-700">
          {
            relationshipLabels[
              dependent.relationship
            ]
          }
        </strong>
      </span>

      <span>
        Last updated{" "}
        {
          formatUpdatedAt(
            dependent.updatedAt,
          )
        }
      </span>
    </div>
  )

  return (
    <ReviewRecordCard
      title={
        getFullName(
          dependent,
        )
      }
      subtitle={
        relationshipLabels[
          dependent.relationship
        ]
      }
      status={
        <ReviewStatusBadge
          status={
            needsReview
              ? "needs_attention"
              : "complete"
          }
          label={
            needsReview
              ? "Needs Review"
              : "Complete"
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
            <CalendarDays
              className="h-4 w-4"
              aria-hidden="true"
            />

            Date of Birth
          </dt>

          <dd className="mt-2 font-semibold text-slate-950">
            {
              formatDate(
                dependent.birthDate,
              )
            }
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Home
              className="h-4 w-4"
              aria-hidden="true"
            />

            Residency
          </dt>

          <dd className="mt-2 font-semibold text-slate-950">
            {dependent.livedWithTaxpayerAllYear
              ? "Lived with taxpayer all year"
              : `${dependent.monthsLivedWithTaxpayer} month${
                  dependent.monthsLivedWithTaxpayer ===
                  1
                    ? ""
                    : "s"
                }`}
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <GraduationCap
              className="h-4 w-4"
              aria-hidden="true"
            />

            Full-Time Student
          </dt>

          <dd className="mt-2 font-semibold text-slate-950">
            {
              dependent.isFullTimeStudent
                ? "Yes"
                : "No"
            }
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <UserRound
              className="h-4 w-4"
              aria-hidden="true"
            />

            Permanently Disabled
          </dt>

          <dd className="mt-2 font-semibold text-slate-950">
            {
              dependent.isPermanentlyDisabled
                ? "Yes"
                : "No"
            }
          </dd>
        </div>

        <div
          className={[
            "rounded-xl border p-4",
            dependent.usCitizenOrResident
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50",
          ].join(" ")}
        >
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <ShieldCheck
              className={[
                "h-4 w-4",
                dependent.usCitizenOrResident
                  ? "text-emerald-700"
                  : "text-amber-700",
              ].join(" ")}
              aria-hidden="true"
            />

            U.S. Citizen or Resident
          </dt>

          <dd className="mt-2 font-semibold text-slate-950">
            {
              dependent.usCitizenOrResident
                ? "Yes"
                : "No"
            }
          </dd>
        </div>

        <div
          className={[
            "rounded-xl border p-4",
            dependent.claimedByAnotherTaxpayer
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50",
          ].join(" ")}
        >
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
            {dependent.claimedByAnotherTaxpayer ? (
              <CircleAlert
                className="h-4 w-4 text-amber-700"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="h-4 w-4 text-emerald-700"
                aria-hidden="true"
              />
            )}

            Claimed by Another Taxpayer
          </dt>

          <dd className="mt-2 font-semibold text-slate-950">
            {
              dependent.claimedByAnotherTaxpayer
                ? "Yes — review required"
                : "No"
            }
          </dd>
        </div>
      </dl>

      {needsReview && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <CircleAlert
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
              aria-hidden="true"
            />

            <div>
              <p className="font-semibold text-amber-950">
                Eligibility review recommended
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-900">
                Review residency, citizenship or resident status, and whether
                another taxpayer may claim this dependent.
              </p>
            </div>
          </div>
        </div>
      )}
    </ReviewRecordCard>
  )
}

export function DependentsReviewPage() {
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
    dependents,
    isLoading,
    errorMessage,
    refresh,
  } =
    useOrganizerReviewDependents(
      clientId,
      taxYear ?? 0,
    )

  const reviewStatus =
    useMemo(
      () =>
        getReviewStatus(
          dependents,
        ),
      [
        dependents,
      ],
    )

  const summary =
    useMemo(
      () => {
        const studentCount =
          dependents.filter(
            (dependent) =>
              dependent.isFullTimeStudent,
          ).length

        const disabilityCount =
          dependents.filter(
            (dependent) =>
              dependent.isPermanentlyDisabled,
          ).length

        const needsReviewCount =
          dependents.filter(
            requiresReview,
          ).length

        return {
          studentCount,
          disabilityCount,
          needsReviewCount,
        }
      },
      [
        dependents,
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
            "Dependents",
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
        currentSection="dependents"
        breadcrumbs={
          breadcrumbs
        }
        header={
          <ReviewSectionHeader
            eyebrow="Organizer Review"
            title="Dependents Review"
            description="Review dependent information entered by the client."
            icon={
              <Baby
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
        currentSection="dependents"
        breadcrumbs={
          breadcrumbs
        }
        header={
          <ReviewSectionHeader
            eyebrow="Organizer Review"
            title="Dependents Review"
            description={`${taxYear} dependent eligibility and residency review.`}
            icon={
              <Baby
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
        clientId={clientId}
        taxYear={taxYear}
        currentSection="dependents"
        breadcrumbs={
          breadcrumbs
        }
        header={
          <ReviewSectionHeader
            eyebrow="Organizer Review"
            title="Dependents Review"
            description={`${taxYear} dependent eligibility and residency review.`}
            icon={
              <Baby
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
      clientId={clientId}
      taxYear={taxYear}
      currentSection="dependents"
      breadcrumbs={
        breadcrumbs
      }
      header={
        <ReviewSectionHeader
          eyebrow={`${taxYear} Tax Organizer`}
          title="Dependents Review"
          description="Review dependent identity, residency, student, disability, citizenship, and claiming information."
          icon={
            <Baby
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
          label="Dependents"
          value={
            dependents.length
          }
          icon={
            <Baby
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone="primary"
        />

        <ReviewMetricCard
          label="Full-Time Students"
          value={
            summary.studentCount
          }
          icon={
            <GraduationCap
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone="violet"
        />

        <ReviewMetricCard
          label="Disabled"
          value={
            summary.disabilityCount
          }
          icon={
            <UserRound
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone="neutral"
        />

        <ReviewMetricCard
          label="Needs Review"
          value={
            summary.needsReviewCount
          }
          icon={
            <CircleAlert
              className="h-5 w-5"
              aria-hidden="true"
            />
          }
          tone={
            summary.needsReviewCount >
            0
              ? "warning"
              : "success"
          }
        />
      </section>

      {dependents.length ===
      0 ? (
        <ReviewEmptyState
          title="No Dependents"
          description="The client has not entered any dependents for this tax year."
          actionLabel="Return to Organizer Review"
          actionHref={
            organizerReviewPath
          }
        />
      ) : (
        <div className="grid gap-5 2xl:grid-cols-2">
          {dependents.map(
            (dependent) => (
              <DependentReviewCard
                key={
                  dependent.dependentId
                }
                dependent={
                  dependent
                }
              />
            ),
          )}
        </div>
      )}
    </OrganizerReviewShell>
  )
}
