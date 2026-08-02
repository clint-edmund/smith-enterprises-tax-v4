export const healthcareCoverageTypes = [
  "employer",
  "marketplace",
  "medicare",
  "medicaid",
  "cobra",
  "private",
  "military",
  "other",
] as const

export type HealthcareCoverageType =
  (typeof healthcareCoverageTypes)[number]

export const healthcareDocumentTypes = [
  "1095_a",
  "1095_b",
  "1095_c",
  "insurance_card",
  "other",
] as const

export type HealthcareDocumentType =
  (typeof healthcareDocumentTypes)[number]

export interface OrganizerHealthcareCoverage {
  coverageId: string

  organizerId: string

  providerName: string

  coverageType:
    HealthcareCoverageType

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
    HealthcareDocumentType | null

  notes:
    string

  recordStatus:
    "draft" |
    "complete" |
    "needs_review"

  createdAt: string

  updatedAt: string
}

export interface CreateOrganizerHealthcareCoverageRequest {
  organizerId: string

  providerName: string

  coverageType:
    HealthcareCoverageType

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
    HealthcareDocumentType | null

  notes: string
}

export interface UpdateOrganizerHealthcareCoverageRequest
  extends CreateOrganizerHealthcareCoverageRequest {
  coverageId: string
}

export interface DeleteOrganizerHealthcareCoverageRequest {
  organizerId: string

  coverageId: string
}