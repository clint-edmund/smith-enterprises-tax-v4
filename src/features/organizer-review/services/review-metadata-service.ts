import type {
  ReviewMetadata,
} from "@/features/organizer-review/types/review-metadata.types"

import {
  normalizeReviewMetadata,
} from "@/features/organizer-review/utils/review-metadata-utils"

export type CreateReviewMetadataRequest =
  Partial<Omit<ReviewMetadata, "checklist">> & {
    completedChecklistItems?: number
    requiredChecklistItems?: number
    totalChecklistItems?: number
  }

export function createReviewMetadata(
  request: CreateReviewMetadataRequest,
): ReviewMetadata {
  return normalizeReviewMetadata(request)
}

export function createPendingReviewMetadata(
  lastUpdatedAt?: string,
): ReviewMetadata {
  return createReviewMetadata({
    status: "pending",
    priority: "medium",
    workflowStage: "organizer_review",
    lastUpdatedAt,
    lastAction: null,
    completedChecklistItems: 0,
    requiredChecklistItems: 0,
    totalChecklistItems: 0,
    riskLevel: "low",
  })
}
