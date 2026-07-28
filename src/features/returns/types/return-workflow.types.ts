import type {
  Json,
} from "@/types/database.types"

export type ReturnWorkflowEventType =
  | "payment_received"
  | "payment_voided"
  | "document_uploaded"
  | "document_version_uploaded"
  | "document_archived"
  | "document_review_requested"
  | "document_approved"
  | "document_changes_requested"
  | "preparer_assigned"
  | "reviewer_assigned"
  | "client_contacted"
  | "client_response_received"
  | "internal_note"
  | "other"

export interface LogReturnWorkflowRequest {
  taxReturnId: string

  eventType: ReturnWorkflowEventType

  eventLabel: string

  eventDescription?: string 

  isClientVisible?: boolean

  eventData?: Json

  occurredAt?: string
}