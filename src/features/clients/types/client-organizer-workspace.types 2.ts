export type ClientOrganizerWorkspaceSectionStatus =
  | "not_started"
  | "pending"
  | "in_progress"
  | "reviewed"
  | "needs_follow_up"
  | "returned_to_client"

export interface ClientOrganizerWorkspaceOrganizer {
  organizerId: string
  clientId: string
  taxYear: number
  status: string
  currentSection: string
  progressPercentage: number
  startedAt: string | null
  submittedAt: string | null
  lastSavedAt: string | null
  updatedAt: string
}

export interface ClientOrganizerWorkspaceAssignment {
  preparerId: string | null
  preparerName: string | null
}

export interface ClientOrganizerWorkspaceReviewSummary {
  incomeSourceCount: number
  reviewedCount: number
  needsFollowUpCount: number
  returnedToClientCount: number
  pendingCount: number
  reviewPercentage: number
}

export interface ClientOrganizerWorkspaceSection {
  key: string
  label: string
  status:
    ClientOrganizerWorkspaceSectionStatus
  isImplemented: boolean
}

export interface ClientOrganizerWorkspace {
  hasOrganizer: boolean
  organizer:
    ClientOrganizerWorkspaceOrganizer | null
  assignment:
    ClientOrganizerWorkspaceAssignment | null
  reviewSummary:
    ClientOrganizerWorkspaceReviewSummary
  sections:
    ClientOrganizerWorkspaceSection[]
}
