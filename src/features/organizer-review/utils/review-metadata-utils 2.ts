import type {
  ReviewChecklistProgress,
  ReviewHealth,
  ReviewLastAction,
  ReviewMetadata,
  ReviewPriority,
  ReviewStatus,
  ReviewWorkflowStage,
} from "@/features/organizer-review/types/review-metadata.types"

export interface ReviewHealthInput {
  status: ReviewStatus
  completedRequiredItems: number
  requiredItems: number
  isWaitingOnClient?: boolean
  hasBlockingIssue?: boolean
}

export interface NormalizeReviewMetadataInput {
  status?: ReviewStatus | null
  health?: ReviewHealth | null
  healthReason?: string | null
  priority?: ReviewPriority | null
  workflowStage?: ReviewWorkflowStage | null
  assignedReviewerId?: string | null
  assignedReviewerName?: string | null
  reviewOwnerId?: string | null
  reviewOwnerName?: string | null
  reviewStartedAt?: string | null
  lastUpdatedAt?: string | null
  lastAction?: ReviewLastAction | null
  completedChecklistItems?: number | null
  requiredChecklistItems?: number | null
  totalChecklistItems?: number | null
  riskLevel?: ReviewPriority | null
}

const statusLabels: Record<ReviewStatus, string> = {
  pending: "Pending Review",
  reviewed: "Reviewed",
  needs_follow_up: "Needs Follow-up",
  returned_to_client: "Returned to Client",
}

const healthLabels: Record<ReviewHealth, string> = {
  healthy: "Healthy",
  needs_attention: "Needs Attention",
  blocked: "Blocked",
}

const priorityLabels: Record<ReviewPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}

const stageLabels: Record<ReviewWorkflowStage, string> = {
  intake: "Intake",
  organizer_review: "Organizer Review",
  tax_preparation: "Tax Preparation",
  quality_review: "Quality Review",
  client_approval: "Client Approval",
  e_file: "E-file",
  archive: "Archive",
}

const actionLabels: Record<ReviewLastAction, string> = {
  review_created: "Review Created",
  staff_note_added: "Staff Note Added",
  marked_reviewed: "Marked Reviewed",
  needs_follow_up: "Needs Follow-up",
  returned_to_client: "Returned to Client",
  client_resubmitted: "Client Resubmitted",
  status_changed: "Status Changed",
}

function toCount(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.trunc(value))
}

export function formatReviewStatus(status: ReviewStatus): string {
  return statusLabels[status]
}

export function formatReviewHealth(health: ReviewHealth): string {
  return healthLabels[health]
}

export function formatReviewPriority(priority: ReviewPriority): string {
  return priorityLabels[priority]
}

export function formatReviewWorkflowStage(
  stage: ReviewWorkflowStage,
): string {
  return stageLabels[stage]
}

export function formatReviewLastAction(
  action: ReviewLastAction | null,
): string {
  return action ? actionLabels[action] : "No activity recorded"
}

export function formatReviewDateTime(value: string | null): string {
  if (!value) {
    return "Not started"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function calculateReviewProgress(
  completedItems: number,
  totalItems: number,
): number {
  const completed = toCount(completedItems)
  const total = toCount(totalItems)

  if (total === 0) {
    return 0
  }

  return Math.min(100, Math.round((completed / total) * 100))
}

export function createReviewChecklistProgress(
  completedItems: number,
  requiredItems: number,
  totalItems: number,
): ReviewChecklistProgress {
  const required = toCount(requiredItems)
  const total = Math.max(required, toCount(totalItems))
  const completed = Math.min(total, toCount(completedItems))

  return {
    completedItems: completed,
    requiredItems: required,
    totalItems: total,
    percentage: calculateReviewProgress(completed, total),
  }
}

export function determineReviewHealth({
  status,
  completedRequiredItems,
  requiredItems,
  isWaitingOnClient = false,
  hasBlockingIssue = false,
}: ReviewHealthInput): ReviewHealth {
  if (
    status === "returned_to_client" ||
    isWaitingOnClient ||
    hasBlockingIssue
  ) {
    return "blocked"
  }

  if (
    status === "needs_follow_up" ||
    completedRequiredItems < requiredItems
  ) {
    return "needs_attention"
  }

  return "healthy"
}

export function normalizeReviewMetadata({
  status = "pending",
  health = null,
  healthReason = null,
  priority = "medium",
  workflowStage = "organizer_review",
  assignedReviewerId = null,
  assignedReviewerName = null,
  reviewOwnerId = null,
  reviewOwnerName = null,
  reviewStartedAt = null,
  lastUpdatedAt = null,
  lastAction = null,
  completedChecklistItems = 0,
  requiredChecklistItems = 0,
  totalChecklistItems = 0,
  riskLevel = "low",
}: NormalizeReviewMetadataInput): ReviewMetadata {
  const normalizedStatus = status ?? "pending"

  const checklist = createReviewChecklistProgress(
    completedChecklistItems ?? 0,
    requiredChecklistItems ?? 0,
    totalChecklistItems ?? 0,
  )

  return {
    status: normalizedStatus,
    health:
      health ??
      determineReviewHealth({
        status: normalizedStatus,
        completedRequiredItems: Math.min(
          checklist.completedItems,
          checklist.requiredItems,
        ),
        requiredItems: checklist.requiredItems,
        isWaitingOnClient:
          normalizedStatus === "returned_to_client",
      }),
    healthReason: healthReason?.trim() || null,
    priority: priority ?? "medium",
    workflowStage: workflowStage ?? "organizer_review",
    assignedReviewerId,
    assignedReviewerName:
      assignedReviewerName?.trim() || null,
    reviewOwnerId,
    reviewOwnerName: reviewOwnerName?.trim() || null,
    reviewStartedAt,
    lastUpdatedAt: lastUpdatedAt ?? new Date().toISOString(),
    lastAction,
    checklist,
    riskLevel: riskLevel ?? "low",
  }
}
