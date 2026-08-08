import type {
  OrganizerReviewWorkflowSectionKey,
} from "../constants/organizer-review-workflow-sections"

export type OrganizerReviewProgressSectionStatus =
  | "not_started"
  | "in_progress"
  | "needs_attention"
  | "complete"

export interface OrganizerReviewProgressSection {
  key:
    OrganizerReviewWorkflowSectionKey

  title: string

  description: string

  href: string

  status:
    OrganizerReviewProgressSectionStatus

  progressPercentage: number

  issueCount: number

  blockingIssueCount: number

  missingDocumentCount: number

  isReadyForReview: boolean

  isRequiredForPreparation:
    boolean

  isImplemented: boolean

  displayOrder: number
}

export interface OrganizerReviewProgress {
  clientId: string

  taxYear: number

  sections:
    OrganizerReviewProgressSection[]

  totalSectionCount: number

  implementedSectionCount: number

  completedSectionCount: number

  requiredSectionCount: number

  completedRequiredSectionCount:
    number

  issueCount: number

  blockingIssueCount: number

  missingDocumentCount: number

  progressPercentage: number

  implementedProgressPercentage:
    number

  nextSection:
    OrganizerReviewProgressSection | null

  isReadyForPreparation:
    boolean
}
