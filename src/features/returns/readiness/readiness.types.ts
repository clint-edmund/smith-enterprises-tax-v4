export type ReadinessCheckStatus =
  | "complete"
  | "attention"
  | "blocked"
  | "not_applicable"

export type ReturnReadinessStatus =
  | "ready"
  | "attention"
  | "blocked"

export type ReadinessConfidence =
  | "high"
  | "medium"
  | "low"

export type ReadinessCheckKey =
  | "client_information"
  | "required_documents"
  | "preparer_assignment"
  | "reviewer_assignment"
  | "filing_requirements"
  | "financial_setup"
  | "workflow_status"

export type ReadinessIssueSeverity =
  | "blocker"
  | "warning"
  | "recommendation"

export interface ReadinessCheck {
  key: ReadinessCheckKey
  label: string
  description: string
  status: ReadinessCheckStatus
  score: number
  weight: number
  blocking: boolean
}

export interface ReadinessIssue {
  id: string
  severity: ReadinessIssueSeverity
  title: string
  description: string
  actionLabel?: string
}

export interface ReturnReadinessResult {
  score: number
  status: ReturnReadinessStatus
  confidence: ReadinessConfidence
  isReadyToPrepare: boolean
  nextAction: string
  checks: ReadinessCheck[]
  blockers: ReadinessIssue[]
  warnings: ReadinessIssue[]
  recommendations: ReadinessIssue[]
  requiredDocumentTotal: number
  requiredDocumentCompleted: number
}