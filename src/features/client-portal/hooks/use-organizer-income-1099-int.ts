import {
  useCallback,
  useState,
} from "react"

import {
  getOrganizerIncome1099IntDetails,
  saveOrganizerIncome1099IntDetails,
} from "@/features/client-portal/services/organizer-income-1099-service"

import type {
  OrganizerIncome1099IntDetails,
  SaveOrganizerIncome1099IntRequest,
  SaveOrganizerIncome1099IntResult,
} from "@/features/client-portal/types/organizer-income-1099.types"

export function useOrganizerIncome1099Int() {
  const [
    details,
    setDetails,
  ] =
    useState<OrganizerIncome1099IntDetails | null>(
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
            await getOrganizerIncome1099IntDetails(
              organizerId,
              incomeSourceId,
            )

          setDetails(result)

          return result
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Form 1099-INT details could not be loaded."

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
          SaveOrganizerIncome1099IntRequest,
      ): Promise<SaveOrganizerIncome1099IntResult> => {
        setIsSaving(true)
        setErrorMessage(null)

        try {
          const result =
            await saveOrganizerIncome1099IntDetails(
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
              : "Form 1099-INT details could not be saved."

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
