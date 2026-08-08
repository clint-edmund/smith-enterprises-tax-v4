export type OrganizerReviewHealthcareCoverageType =
  | "employer"
  | "marketplace"
  | "medicare"
  | "medicaid"
  | "cobra"
  | "private"
  | "military"
  | "other"

export type OrganizerReviewHealthcareDocumentType =
  | "1095_a"
  | "1095_b"
  | "1095_c"
  | "insurance_card"
  | "other"

export type OrganizerReviewHealthcareRecordStatus =
  | "draft"
  | "complete"
  | "needs_review"

export interface OrganizerReviewHealthcareCoverage {
  organizerId: string

  coverageId: string

  providerName: string

  coverageType:
    OrganizerReviewHealthcareCoverageType

  coveredPersonName: string

  policyNumber:
    string | null

  startMonth:
    number | null

  endMonth:
    number | null

  isFullYearCoverage:
    boolean

  documentReceived:
    boolean

  documentType:
    OrganizerReviewHealthcareDocumentType | null

  notes: string

  recordStatus:
    OrganizerReviewHealthcareRecordStatus

  displayOrder: number

  createdAt: string

  updatedAt: string
}
