import type {
  Database,
} from "@/types/database.types"

export type PaymentMethod =
  Database["public"]["Enums"]["payment_method"]

export interface ReturnPayment {
  id: string

  taxReturnId: string

  clientId: string

  amount: number

  paymentDate: string

  paymentMethod: PaymentMethod

  referenceNumber: string | null

  notes: string | null

  receiptNumber: string | null

  receiptIssuedAt: string | null

  receiptIssuedBy: string | null

  isVoided: boolean

  voidedAt: string | null

  voidedBy: string | null

  voidReason: string | null

  createdBy: string | null

  createdByName: string

  createdAt: string

  updatedAt: string
}

export interface ReturnPaymentSummary {
  preparationFee: number

  discountAmount: number

  netFee: number

  totalPaid: number

  outstandingBalance: number

  paymentCount: number
}

export interface RecordPaymentValues {
  taxReturnId: string

  amount: number

  paymentDate: string

  paymentMethod: PaymentMethod

  referenceNumber: string

  notes: string
}

export interface RecordPaymentResult {
  payment: ReturnPayment

  message: string
}

export interface VoidPaymentValues {
  paymentId: string
  voidReason: string
}

export interface VoidPaymentResult {
  payment: ReturnPayment
  message: string
}