export type DocumentAnalysisStatus =
  | "pending"
  | "queued"
  | "processing"
  | "completed"
  | "review_required"
  | "failed"
  | "cancelled"

export interface DocumentAnalysisJob {
  jobId: string
  documentId: string
  organizerId: string | null
  evidenceId: string | null
  providerKey: string
  providerName: string
  status: DocumentAnalysisStatus
  requestedBy: string | null
  requestedByName: string
  requestedAt: string
  queuedAt: string | null
  processingStartedAt: string | null
  completedAt: string | null
  failedAt: string | null
  attemptCount: number
  maxAttempts: number
  failureCode: string | null
  failureMessage: string | null
  resultId: string | null
  documentType: string | null
  overallConfidence: number | null
  requiresStaffReview: boolean | null
  reviewOutcome: string | null
  reviewedByName: string | null
  reviewedAt: string | null
}

export interface QueueDocumentAnalysisRequest {
  documentId: string
  organizerId: string | null
  evidenceId?: string | null
  providerKey?: string
  metadata?: Record<string, unknown>
}
