export interface ClientPortalUser {
  id: string
  clientId: string

  firstName: string
  lastName: string

  email: string

  profilePhotoUrl: string | null

  currentTaxYear: number

  returnStatus: ClientReturnStatus

  progressPercent: number
}

export type ClientReturnStatus =
  | "not_started"
  | "awaiting_information"
  | "documents_received"
  | "in_preparation"
  | "under_review"
  | "awaiting_signature"
  | "filed"
  | "completed"

export interface ClientReturnSummary {
  id: string

  taxYear: number

  status: ClientReturnStatus

  progressPercent: number

  estimatedRefund: number | null

  estimatedBalanceDue: number | null

  lastUpdated: string
}

export interface ClientDashboardCard {
  id: string

  title: string

  description: string

  completed: boolean
}

export interface ClientProgressStep {
  id: string

  title: string

  description: string

  completed: boolean

  completedAt: string | null
}

export interface ClientNotification {
  id: string

  title: string

  message: string

  createdAt: string

  read: boolean
}

export interface ClientDocument {
  id: string

  name: string

  documentType: string

  uploadedAt: string

  uploadedBy: string

  sizeInBytes: number

  downloadUrl: string | null
}

export interface ClientPortalNavigationItem {
  label: string

  href: string

  icon: string
}