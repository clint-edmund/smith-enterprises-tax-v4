import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getOrganizerReviewOverview,
} from "../services"

import type {
  OrganizerReviewOverview,
} from "../types"

interface UseOrganizerReviewResult {
  overview:
    OrganizerReviewOverview | null

  isLoading: boolean

  errorMessage:
    string | null

  refresh: () => Promise<void>
}

export function useOrganizerReview(
  clientId: string,
  taxYear: number,
): UseOrganizerReviewResult {
  const [
    overview,
    setOverview,
  ] =
    useState<OrganizerReviewOverview | null>(
      null,
    )

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

  const load =
    useCallback(
      async () => {
        if (!clientId) {
          setOverview(null)
          setIsLoading(false)
          return
        }

        try {
          setIsLoading(true)
          setErrorMessage(null)

          const result =
            await getOrganizerReviewOverview(
              clientId,
              taxYear,
            )

          setOverview(
            result,
          )
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load organizer review.",
          )
        } finally {
          setIsLoading(false)
        }
      },
      [
        clientId,
        taxYear,
      ],
    )

  useEffect(() => {
    void load()
  }, [load])

  return {
    overview,

    isLoading,

    errorMessage,

    refresh: load,
  }
}