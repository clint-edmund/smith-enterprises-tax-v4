export type TaxOrganizerStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"

export type TaxOrganizerSectionKey =
  | "personal"
  | "identity"
  | "banking"
  | "dependents"
  | "income"
  | "business"
  | "rental"
  | "healthcare"
  | "education"
  | "deductions"
  | "documents"
  | "review"
  | "signature"

export type TaxOrganizerSectionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "needs_attention"

export interface TaxOrganizer {
  id: string
  clientId: string
  taxYear: number
  status: TaxOrganizerStatus
  currentSection: TaxOrganizerSectionKey
  progressPercentage: number
  startedAt: string | null
  lastSavedAt: string | null
  submittedAt: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TaxOrganizerSection {
  id: string
  organizerId: string
  sectionKey: TaxOrganizerSectionKey
  status: TaxOrganizerSectionStatus
  progressPercentage: number
  startedAt: string | null
  completedAt: string | null
  lastSavedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TaxOrganizerSummary {
  organizer: TaxOrganizer
  sections: TaxOrganizerSection[]
  completedSections: number
  totalSections: number
}