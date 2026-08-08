export type ReviewStatus =
  | "pending"
  | "reviewed"
  | "needs_follow_up"
  | "returned_to_client"

export type ReviewHealth =
  | "healthy"
  | "needs_attention"
  | "blocked"

export type ReviewPriority =
  | "low"
  | "medium"
  | "high"
  | "critical"

export type ReviewWorkflowStage =
  | "intake"
  | "organizer_review"
  | "tax_preparation"
  | "quality_review"
  | "client_approval"
  | "e_file"
  | "archive"

export type ReviewLastAction =
  | "review_created"
  | "staff_note_added"
  | "marked_reviewed"
  | "needs_follow_up"
  | "returned_to_client"
  | "client_resubmitted"
  | "status_changed"

export interface ReviewChecklistProgress {
  completedItems: number
  requiredItems: number
  totalItems: number
  percentage: number
}

export interface ReviewMetadata {
  status: ReviewStatus
  health: ReviewHealth
  healthReason: string | null
  priority: ReviewPriority
  workflowStage: ReviewWorkflowStage
  assignedReviewerId: string | null
  assignedReviewerName: string | null
  reviewOwnerId: string | null
  reviewOwnerName: string | null
  reviewStartedAt: string | null
  lastUpdatedAt: string
  lastAction: ReviewLastAction | null
  checklist: ReviewChecklistProgress
  riskLevel: ReviewPriority
}
