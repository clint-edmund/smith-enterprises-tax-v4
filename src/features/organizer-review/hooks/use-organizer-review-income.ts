import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getOrganizerReviewIncome,
} from "@/features/organizer-review/services"

import type {
  OrganizerReviewIncomeSource,
} from "@/features/organizer-review/types"

interface UseOrganizerReviewIncomeResult {
  incomeSources:
    OrganizerReviewIncomeSource[]

  isLoading: boolean

  errorMessage:
    string | null

  refresh:
    () => Promise<void>
}

export function useOrganizerReviewIncome(
  clientId: string,
  taxYear: number,
): UseOrganizerReviewIncomeResult {
  const [
    incomeSources,
    setIncomeSources,
  ] =
    useState<
      OrganizerReviewIncomeSource[]
    >([])

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    )

  const refresh =
    useCallback(async () => {
      const normalizedClientId =
        clientId.trim()

      if (
        !normalizedClientId ||
        !Number.isInteger(
          taxYear,
        ) ||
        taxYear < 1900 ||
        taxYear > 2200
      ) {
        setIncomeSources([])
        setErrorMessage(
          "A valid client and tax year are required.",
        )
        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getOrganizerReviewIncome(
            normalizedClientId,
            taxYear,
          )

        setIncomeSources(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load staff income review:",
          error,
        )

        setIncomeSources([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load income review.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [
      clientId,
      taxYear,
    ])

  useEffect(() => {
    void refresh()
  }, [
    refresh,
  ])

  return {
    incomeSources,
    isLoading,
    errorMessage,
    refresh,
  }
}
