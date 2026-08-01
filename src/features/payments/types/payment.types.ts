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

export interface PaymentReceiptDetails {
  paymentId: string
  taxReturnId: string
  clientId: string
  clientNumber: number | null
  clientName: string
  taxYear: number
  returnType: string
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  referenceNumber: string | null
  notes: string | null
  receiptNumber: string | null
  receiptIssuedAt: string | null
  receiptIssuedBy: string | null
  receiptIssuedByName: string
  createdBy: string | null
  createdByName: string
  isVoided: boolean
  voidedAt: string | null
  voidedBy: string | null
  voidedByName: string | null
  voidReason: string | null
  createdAt: string
  updatedAt: string
}

export interface OfficePaymentSummary {
  paymentsToday: number
  paymentCountToday: number

  paymentsThisMonth: number
  paymentCountThisMonth: number

  outstandingReceivables: number
  returnsWithBalance: number

  voidedPaymentsTotal: number
  voidedPaymentCount: number
}

export interface OfficePaymentRecord {
  paymentId: string

  taxReturnId: string

  clientId: string

  clientNumber: number | null

  clientName: string

  taxYear: number

  returnType: string

  taxForm: string

  amount: number

  paymentDate: string

  paymentMethod: PaymentMethod

  referenceNumber: string | null

  receiptNumber: string | null

  isVoided: boolean

  voidedAt: string | null

  voidReason: string | null

  createdBy: string | null

  createdByName: string

  createdAt: string
}