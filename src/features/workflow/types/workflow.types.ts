export const workflowStatuses = [
  "intake",
  "documents_pending",
  "ready_for_preparation",
  "in_preparation",
  "review",
  "signature_pending",
  "ready_to_file",
  "filed",
  "completed",
  "on_hold",
] as const

export type WorkflowStatus =
  (typeof workflowStatuses)[number]

export interface WorkflowStatusOption {
  value: WorkflowStatus
  label: string
  description: string
  order: number
}