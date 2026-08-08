export const documentReviewPriorityCodes = [
  "overdue",
  "due_today",
  "due_this_week",
  "upcoming",
  "no_due_date",
] as const

export type DocumentReviewPriorityCode =
  (typeof documentReviewPriorityCodes)[number]

export interface DocumentReviewQueueItem {
  documentId: string
  clientId: string
  clientNumber: number
  clientName: string
  taxReturnId: string | null
  taxYear: number | null
  returnType: string | null
  originalFileName: string
  category: string
  reviewStatus: "pending_review"
  reviewRequestedBy: string | null
  reviewRequestedByName: string | null
  reviewRequestedAt: string | null
  assignedReviewerId: string
  assignedReviewerName: string | null
  reviewDueAt: string | null
  uploadedBy: string
  uploadedByName: string | null
  createdAt: string
  priorityCode: DocumentReviewPriorityCode
  daysUntilDue: number | null
}

export interface DocumentReviewQueueSummary {
  total: number
  overdue: number
  dueToday: number
  dueThisWeek: number
  upcoming: number
  noDueDate: number
}

export interface DocumentReviewQueueData {
  items: DocumentReviewQueueItem[]
  summary: DocumentReviewQueueSummary
}