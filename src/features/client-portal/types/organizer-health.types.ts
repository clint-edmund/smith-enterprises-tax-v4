import type {
  TaxOrganizerSectionKey,
  TaxOrganizerSectionStatus,
} from "@/features/client-portal/types/tax-organizer.types"

export const organizerHealthLevels = [
  "not_started",
  "in_progress",
  "needs_attention",
  "complete",
] as const

export type OrganizerHealthLevel =
  (typeof organizerHealthLevels)[number]

export const organizerIssueSeverities = [
  "information",
  "warning",
  "blocking",
] as const

export type OrganizerIssueSeverity =
  (typeof organizerIssueSeverities)[number]

export interface OrganizerHealthIssue {
  issueId: string

  sectionKey:
    TaxOrganizerSectionKey

  severity:
    OrganizerIssueSeverity

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

export interface OrganizerSectionHealth {
  sectionKey:
    TaxOrganizerSectionKey

  sectionTitle: string

  sectionStatus:
    TaxOrganizerSectionStatus

  healthLevel:
    OrganizerHealthLevel

  progressPercentage:
    number

  recordCount:
    number

  completedRecordCount:
    number

  missingDocumentCount:
    number

  issueCount:
    number

  blockingIssueCount:
    number

  lastUpdatedAt:
    string | null

  isReadyForReview:
    boolean

  issues:
    OrganizerHealthIssue[]
}

export interface OrganizerHealthOverview {
  organizerId: string

  taxYear: number

  overallProgressPercentage:
    number

  totalSectionCount:
    number

  completedSectionCount:
    number

  inProgressSectionCount:
    number

  notStartedSectionCount:
    number

  needsAttentionSectionCount:
    number

  totalIssueCount:
    number

  blockingIssueCount:
    number

  missingDocumentCount:
    number

  isReadyForReview:
    boolean

  lastUpdatedAt:
    string | null

  sections:
    OrganizerSectionHealth[]
}