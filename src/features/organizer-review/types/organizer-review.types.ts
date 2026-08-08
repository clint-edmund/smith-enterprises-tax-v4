export const organizerReviewSectionKeys = [
  "personal_information",
  "dependents",
  "income",
  "healthcare",
  "investments",
  "business",
  "education",
  "deductions",
  "documents",
  "banking",
  "final_review",
] as const

export type OrganizerReviewSectionKey =
  (typeof organizerReviewSectionKeys)[number]

export type OrganizerReviewSectionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "needs_review"

export type OrganizerReviewHealthLevel =
  | "not_started"
  | "in_progress"
  | "needs_attention"
  | "complete"

export type OrganizerReviewIssueSeverity =
  | "information"
  | "warning"
  | "blocking"

export interface OrganizerReviewIssue {
  issueId: string

  sectionKey:
    OrganizerReviewSectionKey

  severity:
    OrganizerReviewIssueSeverity

  title: string

  description: string

  recordId:
    string | null

  fieldKey:
    string | null

  actionLabel:
    string | null

  actionPath:
    string | null
}

export interface OrganizerReviewSection {
  sectionKey:
    OrganizerReviewSectionKey

  sectionTitle: string

  sectionStatus:
    OrganizerReviewSectionStatus

  healthLevel:
    OrganizerReviewHealthLevel

  progressPercentage: number

  recordCount: number

  completedRecordCount: number

  missingDocumentCount: number

  issueCount: number

  blockingIssueCount: number

  lastUpdatedAt:
    string | null

  isReadyForReview:
    boolean

  issues:
    OrganizerReviewIssue[]
}

export interface OrganizerReviewClientSummary {
  clientId: string

  clientNumber: string

  clientName: string

  email:
    string | null

  phone:
    string | null
}

export interface OrganizerReviewOverview {
  organizerId: string

  clientId: string

  taxYear: number

  organizerStatus: string

  currentSection:
    OrganizerReviewSectionKey | null

  overallProgressPercentage: number

  totalSectionCount: number

  completedSectionCount: number

  inProgressSectionCount: number

  needsAttentionSectionCount: number

  missingDocumentCount: number

  totalIssueCount: number

  blockingIssueCount: number

  isReadyForReview:
    boolean

  lastUpdatedAt:
    string | null

  client:
    OrganizerReviewClientSummary

  sections:
    OrganizerReviewSection[]
}