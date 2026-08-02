import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getOrganizerBankingInformation,
  saveOrganizerBankingInformation,
} from "@/features/client-portal/services/organizer-banking-information-service"

import type {
  OrganizerBankingInformation,
  SaveOrganizerBankingInformationRequest,
  SaveOrganizerBankingInformationResponse,
} from "@/features/client-portal/types/organizer-banking-information.types"

interface UseOrganizerBankingInformationResult {
  bankingInformation:
    OrganizerBankingInformation | null

  isLoading: boolean

  isSaving: boolean

  errorMessage:
    string | null

  saveMessage:
    string | null

  refresh:
    () => Promise<void>

  save:
    (
      request:
        SaveOrganizerBankingInformationRequest,
    ) => Promise<SaveOrganizerBankingInformationResponse>
}

export function useOrganizerBankingInformation(
  organizerId: string,
): UseOrganizerBankingInformationResult {
  const [
    bankingInformation,
    setBankingInformation,
  ] =
    useState<OrganizerBankingInformation | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  )

  const [
    saveMessage,
    setSaveMessage,
  ] = useState<string | null>(
    null,
  )

  const refresh =
    useCallback(async () => {
      const normalizedOrganizerId =
        organizerId.trim()

      if (!normalizedOrganizerId) {
        setBankingInformation(null)
        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getOrganizerBankingInformation(
            normalizedOrganizerId,
          )

        setBankingInformation(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load organizer banking information:",
          error,
        )

        setBankingInformation(null)

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Banking information could not be loaded.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [
      organizerId,
    ])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function save(
    request:
      SaveOrganizerBankingInformationRequest,
  ): Promise<SaveOrganizerBankingInformationResponse> {
    try {
      setIsSaving(true)
      setErrorMessage(null)
      setSaveMessage(null)

      const result =
        await saveOrganizerBankingInformation(
          request,
        )

      await refresh()

      setSaveMessage(
        result.sectionStatus ===
        "completed"
          ? "Banking Information was saved and marked complete."
          : "Your Banking Information draft was saved.",
      )

      return result
    } catch (error) {
      console.error(
        "Unable to save organizer banking information:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "Banking information could not be saved."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  return {
    bankingInformation,
    isLoading,
    isSaving,
    errorMessage,
    saveMessage,
    refresh,
    save,
  }
}