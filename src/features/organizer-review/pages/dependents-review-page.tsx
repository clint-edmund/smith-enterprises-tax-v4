import {
  Baby,
  CircleAlert,
  GraduationCap,
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
  ReviewSectionHeader,
} from "@/features/organizer-review/components"

import {
  useOrganizerReviewDependents,
} from "@/features/organizer-review/hooks"

import {
  OrganizerReviewLayout,
  OrganizerReviewShell,
} from "@/features/organizer-review/layouts"

import {
  DependentReviewCard,
  dependentRequiresReview,
} from "@/features/organizer-review/components/dependent-review-card"

import type {
  OrganizerReviewDependent,
} from "@/features/organizer-review/types"

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
      dependentRequiresReview,
    )
  ) {
    return "needs_attention" as const
  }

  return "complete" as const
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
            dependentRequiresReview,
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
