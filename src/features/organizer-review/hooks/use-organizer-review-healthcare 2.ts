import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getOrganizerReviewHealthcare,
} from "@/features/organizer-review/services"

import type {
  OrganizerReviewHealthcareCoverage,
} from "@/features/organizer-review/types"

interface UseOrganizerReviewHealthcareResult {
  coverages:
    OrganizerReviewHealthcareCoverage[]

  isLoading: boolean

  errorMessage:
    string | null

  refresh:
    () => Promise<void>
}

export function useOrganizerReviewHealthcare(
  clientId: string,
  taxYear: number,
): UseOrganizerReviewHealthcareResult {
  const [
    coverages,
    setCoverages,
  ] =
    useState<
      OrganizerReviewHealthcareCoverage[]
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
        setCoverages([])
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
          await getOrganizerReviewHealthcare(
            normalizedClientId,
            taxYear,
          )

        setCoverages(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load staff healthcare review:",
          error,
        )

        setCoverages([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load healthcare review.",
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
    coverages,
    isLoading,
    errorMessage,
    refresh,
  }
}
