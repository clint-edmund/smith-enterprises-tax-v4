export type DashboardActivityEntityType =
  | "client"
  | "return"
  | "payment"
  | "document"
  | "user"
  | "system"

export type DashboardActivityAction =
  | "client_created"
  | "client_updated"
  | "return_created"
  | "return_updated"
  | "return_status_changed"
  | "payment_recorded"
  | "document_uploaded"
  | "user_signed_in"
  | string

export interface DashboardActivity {
  id: string
  action: DashboardActivityAction
  entityType: DashboardActivityEntityType | string
  entityId: string | null
  actorName: string
  occurredAt: string
  description?: string
}