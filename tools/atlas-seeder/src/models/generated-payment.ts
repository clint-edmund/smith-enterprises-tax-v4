export type AtlasPaymentMethod =
  | "cash"
  | "check"
  | "credit_card"
  | "debit_card"
  | "ach"
  | "money_order"
  | "other"

export type AtlasPaymentScenario =
  | "unpaid"
  | "deposit_only"
  | "partial"
  | "paid_in_full"
  | "multiple_payments"

export interface GeneratedPayment {
  clientNumber: number
  taxYear: number

  paymentSequence: number

  paymentDate: string
  paymentMethod: AtlasPaymentMethod

  amount: number

  scenario: AtlasPaymentScenario

  notes: string
}