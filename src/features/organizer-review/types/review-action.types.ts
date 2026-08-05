import type {
  Json,
} from "@/types/database.types"

export type ReviewActionKey =
  | "mark_reviewed"
  | "needs_follow_up"
  | "return_to_client"

export type ReviewWorkflowEventType =
  | "marked_reviewed"
  | "needs_follow_up"
  | "returned_to_client"

export interface AddReviewWorkflowEventRequest {
  organizerId: string

  sectionKey:
    | "income"
    | "dependents"
    | "healthcare"
    | "deductions"
    | "credits"
    | "business"
    | "investments"
    | "final_review"

  subjectType:
    | "income_source"
    | "dependent"
    | "healthcare_record"
    | "deduction"
    | "credit"
    | "business_record"
    | "investment_record"
    | "organizer"

  subjectId: string

  eventType:
    ReviewWorkflowEventType

  explanation: string

  metadata?: Json
}
