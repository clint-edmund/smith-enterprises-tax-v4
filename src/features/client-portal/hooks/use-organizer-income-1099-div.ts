import {
  useCallback,
  useState,
} from "react"

import {
  getOrganizerIncome1099DivDetails,
  saveOrganizerIncome1099DivDetails,
} from "@/features/client-portal/services/organizer-income-1099-service"

import type {
  OrganizerIncome1099DivDetails,
  SaveOrganizerIncome1099DivRequest,
  SaveOrganizerIncome1099DivResult,
} from "@/features/client-portal/types/organizer-income-1099.types"

export function useOrganizerIncome1099Div() {
  const [
    details,
    setDetails,
  ] =
    useState<OrganizerIncome1099DivDetails | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(false)

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    )

  const load =
    useCallback(
      async (
        organizerId: string,
        incomeSourceId: string,
      ) => {
        setIsLoading(true)
        setErrorMessage(null)

        try {
          const result =
            await getOrganizerIncome1099DivDetails(
              organizerId,
              incomeSourceId,
            )

          setDetails(result)

          return result
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Form 1099-DIV details could not be loaded."

          setErrorMessage(message)
          throw error
        } finally {
          setIsLoading(false)
        }
      },
      [],
    )

  const save =
    useCallback(
      async (
        request:
          SaveOrganizerIncome1099DivRequest,
      ): Promise<SaveOrganizerIncome1099DivResult> => {
        setIsSaving(true)
        setErrorMessage(null)

        try {
          const result =
            await saveOrganizerIncome1099DivDetails(
              request,
            )

          setDetails(
            result.details,
          )

          return result
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Form 1099-DIV details could not be saved."

          setErrorMessage(message)
          throw error
        } finally {
          setIsSaving(false)
        }
      },
      [],
    )

  const clear =
    useCallback(
      () => {
        setDetails(null)
        setErrorMessage(null)
      },
      [],
    )

  return {
    details,
    isLoading,
    isSaving,
    errorMessage,
    load,
    save,
    clear,
  }
}
