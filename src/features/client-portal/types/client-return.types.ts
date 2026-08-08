export interface ClientReturnSummary {
  returnId: string

  taxYear: number

  returnType: string

  taxForm: string

  status: string

  assignedPreparerName: string | null

  updatedAt: string

  preparationFee: number

  discountAmount: number

  totalPayments: number

  outstandingBalance: number

  documentCount: number
}