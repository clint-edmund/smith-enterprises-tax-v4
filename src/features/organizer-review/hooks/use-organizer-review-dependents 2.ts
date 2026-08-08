import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getOrganizerReviewDependents,
} from "@/features/organizer-review/services"

import type {
  OrganizerReviewDependent,
} from "@/features/organizer-review/types"

interface UseOrganizerReviewDependentsResult {
  dependents:
    OrganizerReviewDependent[]

  isLoading: boolean

  errorMessage:
    string | null

  refresh:
    () => Promise<void>
}

export function useOrganizerReviewDependents(
  clientId: string,
  taxYear: number,
): UseOrganizerReviewDependentsResult {
  const [
    dependents,
    setDependents,
  ] =
    useState<
      OrganizerReviewDependent[]
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
        setDependents([])

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
          await getOrganizerReviewDependents(
            normalizedClientId,
            taxYear,
          )

        setDependents(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load staff dependents review:",
          error,
        )

        setDependents([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load dependents review.",
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
    dependents,
    isLoading,
    errorMessage,
    refresh,
  }
}
