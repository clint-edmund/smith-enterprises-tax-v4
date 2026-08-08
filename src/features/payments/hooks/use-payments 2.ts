import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getReturnPayments,
  getReturnPaymentSummary,
} from "../services/payment-service"

import type {
  ReturnPayment,
  ReturnPaymentSummary,
} from "../types/payment.types"

const emptySummary: ReturnPaymentSummary = {
  preparationFee: 0,
  discountAmount: 0,
  netFee: 0,
  totalPaid: 0,
  outstandingBalance: 0,
  paymentCount: 0,
}

interface UsePaymentsResult {
  payments: ReturnPayment[]
  summary: ReturnPaymentSummary
  isLoading: boolean
  isRefreshing: boolean
  errorMessage: string | null
  refreshPayments: () => Promise<void>
}

export function usePayments(
  taxReturnId: string,
): UsePaymentsResult {
  const [
    payments,
    setPayments,
  ] = useState<ReturnPayment[]>([])

  const [
    summary,
    setSummary,
  ] = useState<ReturnPaymentSummary>(
    emptySummary,
  )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  const loadPayments = useCallback(
    async (
      showRefreshing = false,
    ): Promise<void> => {
      const normalizedReturnId =
        taxReturnId.trim()

      if (!normalizedReturnId) {
        setPayments([])
        setSummary(emptySummary)
        setErrorMessage(
          "A tax-return identifier is required.",
        )
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      if (showRefreshing) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setErrorMessage(null)

      try {
        const [
          paymentRecords,
          paymentSummary,
        ] = await Promise.all([
          getReturnPayments(
            normalizedReturnId,
          ),

          getReturnPaymentSummary(
            normalizedReturnId,
          ),
        ])

        setPayments(paymentRecords)
        setSummary(paymentSummary)
      } catch (error) {
        console.error(
          "Unable to load payments:",
          error,
        )

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load payment information.",
        )
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [taxReturnId],
  )

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadPayments()
      }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadPayments])

  const refreshPayments =
    useCallback(async (): Promise<void> => {
      await loadPayments(true)
    }, [loadPayments])

  return {
    payments,
    summary,
    isLoading,
    isRefreshing,
    errorMessage,
    refreshPayments,
  }
}