export type AtlasReturnType =
  | "individual"
  | "business"
  | "amended"
  | "extension"
  | "other"

export type AtlasTaxFormType =
  | "1040"
  | "1040_nr"
  | "1041"
  | "1065"
  | "1120"
  | "1120_s"
  | "990"
  | "schedule_c"
  | "state_only"
  | "other"

export type AtlasReturnStatus =
  | "not_started"
  | "documents_pending"
  | "in_progress"
  | "ready_for_review"
  | "under_review"
  | "ready_to_file"
  | "filed"
  | "accepted"
  | "rejected"
  | "completed"
  | "on_hold"

export type AtlasWorkflowStatus =
  | "intake"
  | "documents_pending"
  | "ready_for_preparation"
  | "in_preparation"
  | "review"
  | "signature_pending"
  | "ready_to_file"
  | "filed"
  | "completed"
  | "on_hold"

export type AtlasReturnFilingStatus =
  | "single"
  | "married_filing_jointly"
  | "married_filing_separately"
  | "head_of_household"
  | "qualifying_surviving_spouse"
  | "not_applicable"

export interface GeneratedReturn {
  clientNumber: number

  taxYear: number

  returnType: AtlasReturnType
  taxForm: AtlasTaxFormType
  filingStatus: AtlasReturnFilingStatus

  status: AtlasReturnStatus
  workflowStatus: AtlasWorkflowStatus

  assignedPreparerEmail: string | null
  assignedReviewerEmail: string | null

  dateReceived: string | null
  dueDate: string | null
  filedDate: string | null
  acceptedDate: string | null

  preparationFee: number
  discountAmount: number

  estimatedRefund: number
  estimatedAmountDue: number

  federalReturnRequired: boolean
  stateReturnRequired: boolean
  localReturnRequired: boolean

  extensionFiled: boolean
  extensionDate: string | null

  workflowStatusChangedAt: string
  assignedAt: string | null

  workflowHoldReason: string | null
  workflowHeldAt: string | null
  workflowCompletedAt: string | null

  description: string
  notes: string

  createdAt: string
  updatedAt: string
}