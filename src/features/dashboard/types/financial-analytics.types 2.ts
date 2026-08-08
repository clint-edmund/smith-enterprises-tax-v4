import type {
  PaymentMethod,
} from "@/features/payments/types/payment.types"

export interface ExecutiveFinancialPeriods {
  todayRevenue: number
  todayPaymentCount: number
  yesterdayRevenue: number
  last7DaysRevenue: number
  previous7DaysRevenue: number
  last30DaysRevenue: number
  yearToDateRevenue: number
  averageDailyRevenue: number
}

export interface ExecutiveCollectionMetrics {
  totalFees: number
  totalCollected: number
  outstandingReceivables: number
  returnsAwaitingPayment: number
  collectionRate: number
}

export interface ExecutivePaymentMethodMetric {
  paymentMethod: PaymentMethod
  paymentCount: number
  totalAmount: number
}

export interface ExecutivePreparerMetric {
  preparerId: string
  preparerName: string
  returnCount: number
  totalFees: number
  totalCollected: number
  outstandingReceivables: number
  collectionRate: number
}

export interface ExecutiveDailySnapshot {
  returnsCompletedToday: number
  paymentsReceivedToday: number
  revenueToday: number
  returnsAwaitingPayment: number
  returnsFiledToday: number
  newClientsToday: number
}

export interface ExecutiveFinancialAnalytics {
  periods: ExecutiveFinancialPeriods
  collection: ExecutiveCollectionMetrics
  paymentMethods: ExecutivePaymentMethodMetric[]
  preparers: ExecutivePreparerMetric[]
  dailySnapshot: ExecutiveDailySnapshot
  generatedAt: string
}
