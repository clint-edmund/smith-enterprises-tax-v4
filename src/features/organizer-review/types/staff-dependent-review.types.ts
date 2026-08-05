export type StaffDependentReviewStatus =
  | "pending"
  | "reviewed"
  | "needs_follow_up"
  | "returned_to_client"

export interface StaffDependentReview {
  reviewId: string | null
  dependentId: string
  reviewStatus:
    StaffDependentReviewStatus
  internalNotes: string
  reviewedBy: string | null
  reviewedByName: string | null
  reviewedAt: string | null
  followUpRequestedAt:
    string | null
  returnedToClientAt:
    string | null
  updatedAt: string
}

export interface SaveDependentReviewNotesRequest {
  dependentId: string
  internalNotes: string
}

export interface MarkDependentReviewNeedsFollowUpRequest {
  dependentId: string
  internalNotes: string
}

export interface ReturnDependentToClientRequest {
  dependentId: string
  internalNotes: string
}
