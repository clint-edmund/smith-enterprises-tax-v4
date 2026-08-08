import {
  useCallback,
  useEffect,
  useState,
} from "react"

import type {
  PaymentReceiptDetails,
} from "../types/payment.types"

import {
  getPaymentReceipt,
  getPaymentServiceErrorMessage,
} from "../services/payment-service"

interface UsePaymentReceiptResult {
  receipt: PaymentReceiptDetails | null
  isLoading: boolean
  errorMessage: string | null
  refreshReceipt: () => Promise<void>
}

export function usePaymentReceipt(
  paymentId: string | null,
): UsePaymentReceiptResult {
  const [
    receipt,
    setReceipt,
  ] = useState<PaymentReceiptDetails | null>(
    null,
  )

  const [
    isLoading,
    setIsLoading,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  const refreshReceipt =
    useCallback(async () => {
      if (!paymentId) {
        setReceipt(null)
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result =
          await getPaymentReceipt(
            paymentId,
          )

        setReceipt(result)
      } catch (error) {
        setReceipt(null)

        setErrorMessage(
          getPaymentServiceErrorMessage(
            error,
          ),
        )
      } finally {
        setIsLoading(false)
      }
    }, [paymentId])

  useEffect(() => {
    void refreshReceipt()
  }, [refreshReceipt])

  return {
    receipt,
    isLoading,
    errorMessage,
    refreshReceipt,
  }
}