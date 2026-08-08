import type {
  StaffIncomeReviewStatus,
} from "./staff-income-review.types"

export interface StaffIncomeReviewActionResult {
  reviewId: string
  incomeSourceId: string
  reviewStatus:
    StaffIncomeReviewStatus
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

export interface MarkIncomeReviewCompleteRequest {
  incomeSourceId: string
}

export interface MarkIncomeReviewNeedsFollowUpRequest {
  incomeSourceId: string
  internalNotes: string
}

export interface SaveIncomeReviewNotesRequest {
  incomeSourceId: string
  internalNotes: string
}

export interface ReturnIncomeRecordToClientRequest {
  incomeSourceId: string
  internalNotes: string
}
