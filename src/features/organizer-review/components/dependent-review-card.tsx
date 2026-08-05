import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  Home,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  ReviewRecordCard,
  ReviewStatusBadge,
} from "@/features/organizer-review/components"

import {
  ReviewTimeline,
} from "@/features/organizer-review/components/review-timeline"

import {
  ReviewStatusHeader,
} from "@/features/organizer-review/components/review-workspace/review-status-header"

import {
  QuickActionsToolbar,
} from "@/features/organizer-review/components/review-workspace/quick-actions-toolbar"

import {
  ReviewActionDialog,
} from "@/features/organizer-review/components/review-workspace/review-action-dialog"

import {
  ReviewNotice,
} from "@/features/organizer-review/components/review-workspace/review-notice"

import {
  useReviewActionRunner,
} from "@/features/organizer-review/hooks/use-review-action-runner"

import {
  createDependentReviewMetadata,
} from "@/features/organizer-review/services/dependent-review-metadata-service"


import {
  useStaffDependentReview,
} from "@/features/organizer-review/hooks/use-staff-dependent-review"

import type {
  OrganizerReviewDependent,
  OrganizerReviewDependentRelationship,
} from "@/features/organizer-review/types"

import {
  dependentRequiresReview,
  formatDependentReviewDate,
  formatDependentReviewUpdatedAt,
  getDependentFullName,
} from "@/features/organizer-review/utils/dependent-review-utils"

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

interface DependentReviewCardProps {
  dependent:
    OrganizerReviewDependent
}

export function DependentReviewCard({
  dependent,
}: DependentReviewCardProps) {
  const {
    review,
    isLoading:
      isReviewLoading,
    isSaving:
      isReviewSaving,
    errorMessage:
      reviewErrorMessage,
    refresh:
      refreshReview,
    markReviewed,
    markNeedsFollowUp,
    returnToClient,
  } = useStaffDependentReview(
    dependent.dependentId,
  )

  const needsReview =
    dependentRequiresReview(
      dependent,
    )

  const reviewMetadata =
    createDependentReviewMetadata({
      review,
      dependentUpdatedAt:
        dependent.updatedAt,
      hasEligibilityConcern:
        needsReview,
    })

  const {
    activeAction,
    isSaving:
      isActionSaving,
    errorMessage:
      actionErrorMessage,
    successMessage:
      actionSuccessMessage,
    timelineVersion,
    openAction,
    closeAction,
    runAction,
    clearMessages:
      clearActionMessages,
  } = useReviewActionRunner({
    organizerId:
      dependent.organizerId,
    sectionKey:
      "dependents",
    subjectType:
      "dependent",
    subjectId:
      dependent.dependentId,
    subjectLabel:
      getDependentFullName(
        dependent,
      ),
    currentStatus:
      review?.reviewStatus ??
      "pending",
    markReviewed,
    markNeedsFollowUp,
    returnToClient,
  })

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
          formatDependentReviewUpdatedAt(
            dependent.updatedAt,
          )
        }
      </span>
    </div>
  )

  return (
    <ReviewRecordCard
      title={
        getDependentFullName(
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
            isReviewLoading
              ? "in_progress"
              : reviewMetadata.status ===
                  "reviewed"
                ? "complete"
                : reviewMetadata.status ===
                    "pending"
                  ? "in_progress"
                  : "needs_attention"
          }
          label={
            isReviewLoading
              ? "Loading Review"
              : reviewMetadata.status ===
                  "reviewed"
                ? "Reviewed"
                : reviewMetadata.status ===
                    "needs_follow_up"
                  ? "Needs Follow-up"
                  : reviewMetadata.status ===
                      "returned_to_client"
                    ? "Returned to Client"
                    : "Pending Review"
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
              formatDependentReviewDate(
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

      <ReviewStatusHeader
        metadata={
          reviewMetadata
        }
        isLoading={
          isReviewLoading
        }
      />

      <QuickActionsToolbar
        status={
          reviewMetadata.status
        }
        isBusy={
          isReviewLoading ||
          isReviewSaving ||
          isActionSaving
        }
        onSelectAction={
          openAction
        }
      />

      {actionSuccessMessage && (
        <ReviewNotice
          tone="success"
          message={
            actionSuccessMessage
          }
          onDismiss={
            clearActionMessages
          }
        />
      )}

      {actionErrorMessage && (
        <ReviewNotice
          tone="error"
          message={
            actionErrorMessage
          }
          onDismiss={
            clearActionMessages
          }
        />
      )}

      <ReviewTimeline
        key={
          timelineVersion
        }
        organizerId={
          dependent.organizerId
        }
        sectionKey="dependents"
        subjectType="dependent"
        subjectId={
          dependent.dependentId
        }
        title="Dependent Review Timeline"
      />

      {reviewErrorMessage && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-950">
            Unable to load staff review
          </p>

          <p className="mt-1 text-sm leading-6 text-red-900">
            {reviewErrorMessage}
          </p>

          <button
            type="button"
            onClick={() => {
              void refreshReview()
            }}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100"
          >
            Try Again
          </button>
        </div>
      )}

      <ReviewActionDialog
        action={
          activeAction
        }
        subjectLabel={
          getDependentFullName(
            dependent,
          )
        }
        isSaving={
          isActionSaving
        }
        onClose={
          closeAction
        }
        onConfirm={
          runAction
        }
      />

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

