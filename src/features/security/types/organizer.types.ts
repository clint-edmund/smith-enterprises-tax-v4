export type OrganizerSection =
  | "personal"
  | "identity"
  | "banking"
  | "dependents"
  | "income"
  | "business"
  | "rental"
  | "healthcare"
  | "documents"
  | "review"

export type OrganizerSectionStatus =
  | "not_started"
  | "in_progress"
  | "completed"

export interface OrganizerProgress {
  clientId: string

  taxYear: number

  overallProgress: number

  completedSections: number

  totalSections: number

  currentSection: OrganizerSection

  lastSavedAt: string | null
}