import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getStaffIncomeReview,
} from "@/features/organizer-review/services"

import type {
  StaffIncomeReview,
} from "@/features/organizer-review/types"

interface UseStaffIncomeReviewOptions {
  clientId: string
  taxYear: number
}

interface UseStaffIncomeReviewResult {
  review:
    StaffIncomeReview | null

  organizer:
    StaffIncomeReview["organizer"] | null

  reviewer:
    StaffIncomeReview["reviewer"] | null

  summary:
    StaffIncomeReview["summary"] | null

  incomeSources:
    StaffIncomeReview["incomeSources"]

  isLoading: boolean
  isRefreshing: boolean
  errorMessage: string | null

  refresh: () => Promise<void>
}

export function useStaffIncomeReview({
  clientId,
  taxYear,
}: UseStaffIncomeReviewOptions): UseStaffIncomeReviewResult {
  const [
    review,
    setReview,
  ] =
    useState<StaffIncomeReview | null>(
      null,
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
  ] =
    useState<string | null>(
      null,
    )

  const normalizedClientId =
    clientId.trim()

  const hasValidRequest =
    Boolean(
      normalizedClientId,
    ) &&
    Number.isInteger(
      taxYear,
    ) &&
    taxYear >= 1900 &&
    taxYear <= 2200

  const loadReview =
    useCallback(
      async (
        refreshOnly:
          boolean,
      ) => {
        if (
          !hasValidRequest
        ) {
          setReview(null)
          setErrorMessage(null)
          setIsLoading(false)
          setIsRefreshing(false)

          return
        }

        if (refreshOnly) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        setErrorMessage(null)

        try {
          const result =
            await getStaffIncomeReview({
              clientId:
                normalizedClientId,

              taxYear,
            })

          setReview(
            result,
          )
        } catch (error) {
          console.error(
            "Unable to load the staff Income Review:",
            error,
          )

          setReview(null)

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load the staff Income Review.",
          )
        } finally {
          if (refreshOnly) {
            setIsRefreshing(false)
          } else {
            setIsLoading(false)
          }
        }
      },
      [
        hasValidRequest,
        normalizedClientId,
        taxYear,
      ],
    )

  useEffect(() => {
    void loadReview(
      false,
    )
  }, [
    loadReview,
  ])

  const refresh =
    useCallback(
      async () => {
        await loadReview(
          true,
        )
      },
      [
        loadReview,
      ],
    )

  return {
    review,

    organizer:
      review?.organizer ??
      null,

    reviewer:
      review?.reviewer ??
      null,

    summary:
      review?.summary ??
      null,

    incomeSources:
      review?.incomeSources ??
      [],

    isLoading,
    isRefreshing,
    errorMessage,
    refresh,
  }
}
