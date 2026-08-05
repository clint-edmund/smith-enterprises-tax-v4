import type {
  StaffDependentReview,
} from "@/features/organizer-review/types/staff-dependent-review.types"

import type {
  ReviewHealth,
  ReviewLastAction,
  ReviewMetadata,
  ReviewPriority,
} from "@/features/organizer-review/types/review-metadata.types"

import {
  createReviewMetadata,
} from "@/features/organizer-review/services/review-metadata-service"

interface CreateDependentReviewMetadataRequest {
  review:
    StaffDependentReview | null
  dependentUpdatedAt: string
  hasEligibilityConcern: boolean
  completedChecklistItems?: number
  requiredChecklistItems?: number
  totalChecklistItems?: number
}

function getLastAction(
  review:
    StaffDependentReview | null,
): ReviewLastAction | null {
  switch (
    review?.reviewStatus
  ) {
    case "reviewed":
      return "marked_reviewed"

    case "needs_follow_up":
      return "needs_follow_up"

    case "returned_to_client":
      return "returned_to_client"

    default:
      return review?.reviewId
        ? "review_created"
        : null
  }
}

function getHealth(
  review:
    StaffDependentReview | null,
  hasEligibilityConcern: boolean,
  requiredItemsComplete: boolean,
): ReviewHealth {
  if (
    review?.reviewStatus ===
    "returned_to_client"
  ) {
    return "blocked"
  }

  if (
    review?.reviewStatus ===
      "needs_follow_up" ||
    hasEligibilityConcern ||
    !requiredItemsComplete
  ) {
    return "needs_attention"
  }

  return "healthy"
}

function getHealthReason(
  review:
    StaffDependentReview | null,
  hasEligibilityConcern: boolean,
  requiredItemsComplete: boolean,
): string | null {
  if (
    review?.reviewStatus ===
    "returned_to_client"
  ) {
    return "This dependent was returned to the client for correction."
  }

  if (
    review?.reviewStatus ===
    "needs_follow_up"
  ) {
    return "Staff follow-up is required before this dependent can be completed."
  }

  if (
    hasEligibilityConcern
  ) {
    return "Eligibility information requires staff review."
  }

  if (
    !requiredItemsComplete
  ) {
    return "Required review checklist items remain incomplete."
  }

  return null
}

function getPriority(
  review:
    StaffDependentReview | null,
  hasEligibilityConcern: boolean,
): ReviewPriority {
  if (
    review?.reviewStatus ===
    "returned_to_client"
  ) {
    return "high"
  }

  if (
    review?.reviewStatus ===
      "needs_follow_up" ||
    hasEligibilityConcern
  ) {
    return "medium"
  }

  return "low"
}

export function createDependentReviewMetadata({
  review,
  dependentUpdatedAt,
  hasEligibilityConcern,
  completedChecklistItems = 0,
  requiredChecklistItems = 0,
  totalChecklistItems = 0,
}: CreateDependentReviewMetadataRequest): ReviewMetadata {
  const requiredItemsComplete =
    requiredChecklistItems >
      0 &&
    completedChecklistItems >=
      requiredChecklistItems

  return createReviewMetadata({
    status:
      review?.reviewStatus ??
      "pending",

    health:
      getHealth(
        review,
        hasEligibilityConcern,
        requiredItemsComplete,
      ),

    healthReason:
      getHealthReason(
        review,
        hasEligibilityConcern,
        requiredItemsComplete,
      ),

    priority:
      getPriority(
        review,
        hasEligibilityConcern,
      ),

    workflowStage:
      "organizer_review",

    assignedReviewerId:
      review?.reviewedBy ??
      null,

    assignedReviewerName:
      review?.reviewedByName ??
      null,

    reviewOwnerId:
      review?.reviewedBy ??
      null,

    reviewOwnerName:
      review?.reviewedByName ??
      null,

    reviewStartedAt:
      review?.reviewedAt ??
      review?.followUpRequestedAt ??
      review?.returnedToClientAt ??
      null,

    lastUpdatedAt:
      review?.updatedAt ??
      dependentUpdatedAt,

    lastAction:
      getLastAction(
        review,
      ),

    completedChecklistItems,

    requiredChecklistItems,

    totalChecklistItems,

    riskLevel:
      hasEligibilityConcern
        ? "medium"
        : "low",
  })
}
