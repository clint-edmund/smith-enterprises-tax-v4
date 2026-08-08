export interface ReviewChecklistItem {
  itemId: string
  itemKey: string
  label: string
  description: string | null
  isRequired: boolean
  displayOrder: number
  isCompleted: boolean
  completedBy: string | null
  completedByName: string | null
  completedAt: string | null
  updatedAt: string
}

export interface ReviewChecklist {
  definitionId: string
  definitionName: string
  version: number
  items:
    ReviewChecklistItem[]
  completedItems: number
  completedRequiredItems: number
  requiredItems: number
  totalItems: number
  completionPercentage: number
  areRequiredItemsComplete: boolean
}

export interface GetReviewChecklistRequest {
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
}

export interface SetReviewChecklistItemRequest
  extends GetReviewChecklistRequest {
  itemId: string
  isCompleted: boolean
}
