import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getOrganizerPersonalInformation,
  saveOrganizerPersonalInformation,
} from "@/features/client-portal/services/organizer-personal-information-service"
import type {
  SaveOrganizerPersonalInformationRequest,
  SaveOrganizerPersonalInformationResult,
} from "@/features/client-portal/services/organizer-personal-information-service"
import type {
  OrganizerPersonalInformation,
} from "@/features/client-portal/types/organizer-personal-information.types"

interface UseOrganizerPersonalInformationResult {
  personalInformation:
    OrganizerPersonalInformation | null

  isLoading: boolean
  isSaving: boolean

  errorMessage: string | null
  saveMessage: string | null

  refresh: () => Promise<void>

  save: (
    request:
      SaveOrganizerPersonalInformationRequest,
  ) => Promise<SaveOrganizerPersonalInformationResult>
}

export function useOrganizerPersonalInformation(
  organizerId: string,
): UseOrganizerPersonalInformationResult {
  const [
    personalInformation,
    setPersonalInformation,
  ] =
    useState<OrganizerPersonalInformation | null>(
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
  ] = useState<string | null>(null)

  const [
    saveMessage,
    setSaveMessage,
  ] = useState<string | null>(null)

  const loadPersonalInformation =
    useCallback(async () => {
      const normalizedOrganizerId =
        organizerId.trim()

      if (!normalizedOrganizerId) {
        setPersonalInformation(null)
        setErrorMessage(
          "An organizer identifier is required.",
        )
        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getOrganizerPersonalInformation(
            normalizedOrganizerId,
          )

        setPersonalInformation(result)
      } catch (error) {
        console.error(
          "Unable to load organizer personal information:",
          error,
        )

        setPersonalInformation(null)

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load personal information.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [organizerId])

  useEffect(() => {
    void loadPersonalInformation()
  }, [loadPersonalInformation])

  const save =
    useCallback(
      async (
        request:
          SaveOrganizerPersonalInformationRequest,
      ) => {
        try {
          setIsSaving(true)
          setErrorMessage(null)
          setSaveMessage(null)

          const result =
            await saveOrganizerPersonalInformation(
              request,
            )

          setSaveMessage(
            result.sectionStatus === "completed"
              ? "Personal information saved and completed."
              : "Personal information saved as a draft.",
          )

          await loadPersonalInformation()

          return result
        } catch (error) {
          console.error(
            "Unable to save organizer personal information:",
            error,
          )

          const message =
            error instanceof Error
              ? error.message
              : "Unable to save personal information."

          setErrorMessage(message)

          throw error
        } finally {
          setIsSaving(false)
        }
      },
      [loadPersonalInformation],
    )

  return {
    personalInformation,
    isLoading,
    isSaving,
    errorMessage,
    saveMessage,
    refresh:
      loadPersonalInformation,
    save,
  }
}