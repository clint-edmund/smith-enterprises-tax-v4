export interface ReturnWorkspaceSummary {
  returnId: string

  clientId: string
  clientName: string

  taxYear: number
  returnType: string
  status: string

  assignedPreparer: string | null
  assignedReviewer: string | null

  dueDate: string | null

  estimatedAmountDue: number
  paymentsReceived: number
  outstandingBalance: number

  createdAt: string
  updatedAt: string

  workflowPercent: number
}