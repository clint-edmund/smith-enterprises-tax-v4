import { supabase } from "@/services/supabase"

import type {
  ExecutiveFinancialAnalytics,
} from "../types/financial-analytics.types"

type ExecutiveAnalyticsRpcResult = {
  data: unknown
  error: {
    message: string
  } | null
}

function toNumber(
  value: unknown,
): number {
  const converted = Number(value)

  return Number.isFinite(converted)
    ? converted
    : 0
}

function toStringValue(
  value: unknown,
  fallback = "",
): string {
  return typeof value === "string"
    ? value
    : fallback
}

function asRecord(
  value: unknown,
): Record<string, unknown> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

export async function getExecutiveFinancialAnalytics():
Promise<ExecutiveFinancialAnalytics> {
  const rpc =
    supabase.rpc.bind(supabase) as unknown as (
      name: string,
    ) => PromiseLike<ExecutiveAnalyticsRpcResult>

  const {
    data,
    error,
  } = await rpc(
    "get_executive_financial_analytics",
  )

  if (error) {
    throw new Error(
      `Unable to load executive financial analytics: ${error.message}`,
    )
  }

  const root = asRecord(data)
  const periods = asRecord(root.periods)
  const collection = asRecord(root.collection)
  const dailySnapshot =
    asRecord(root.dailySnapshot)

  const paymentMethods =
    Array.isArray(root.paymentMethods)
      ? root.paymentMethods
      : []

  const preparers =
    Array.isArray(root.preparers)
      ? root.preparers
      : []

  return {
    periods: {
      todayRevenue:
        toNumber(periods.todayRevenue),
      todayPaymentCount:
        toNumber(periods.todayPaymentCount),
      yesterdayRevenue:
        toNumber(periods.yesterdayRevenue),
      last7DaysRevenue:
        toNumber(periods.last7DaysRevenue),
      previous7DaysRevenue:
        toNumber(periods.previous7DaysRevenue),
      last30DaysRevenue:
        toNumber(periods.last30DaysRevenue),
      yearToDateRevenue:
        toNumber(periods.yearToDateRevenue),
      averageDailyRevenue:
        toNumber(periods.averageDailyRevenue),
    },

    collection: {
      totalFees:
        toNumber(collection.totalFees),
      totalCollected:
        toNumber(collection.totalCollected),
      outstandingReceivables:
        toNumber(
          collection.outstandingReceivables,
        ),
      returnsAwaitingPayment:
        toNumber(
          collection.returnsAwaitingPayment,
        ),
      collectionRate:
        toNumber(collection.collectionRate),
    },

    paymentMethods:
      paymentMethods.map((item) => {
        const record = asRecord(item)

        return {
          paymentMethod:
            toStringValue(
              record.paymentMethod,
              "other",
            ) as ExecutiveFinancialAnalytics[
              "paymentMethods"
            ][number]["paymentMethod"],
          paymentCount:
            toNumber(record.paymentCount),
          totalAmount:
            toNumber(record.totalAmount),
        }
      }),

    preparers:
      preparers.map((item) => {
        const record = asRecord(item)

        return {
          preparerId:
            toStringValue(record.preparerId),
          preparerName:
            toStringValue(
              record.preparerName,
              "Unknown staff member",
            ),
          returnCount:
            toNumber(record.returnCount),
          totalFees:
            toNumber(record.totalFees),
          totalCollected:
            toNumber(record.totalCollected),
          outstandingReceivables:
            toNumber(
              record.outstandingReceivables,
            ),
          collectionRate:
            toNumber(record.collectionRate),
        }
      }),

    dailySnapshot: {
      returnsCompletedToday:
        toNumber(
          dailySnapshot.returnsCompletedToday,
        ),
      paymentsReceivedToday:
        toNumber(
          dailySnapshot.paymentsReceivedToday,
        ),
      revenueToday:
        toNumber(dailySnapshot.revenueToday),
      returnsAwaitingPayment:
        toNumber(
          dailySnapshot.returnsAwaitingPayment,
        ),
      returnsFiledToday:
        toNumber(
          dailySnapshot.returnsFiledToday,
        ),
      newClientsToday:
        toNumber(dailySnapshot.newClientsToday),
    },

    generatedAt:
      toStringValue(
        root.generatedAt,
        new Date().toISOString(),
      ),
  }
}
