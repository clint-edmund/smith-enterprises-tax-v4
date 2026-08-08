import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getOrganizerIdentityInformation,
  saveOrganizerIdentityInformation,
} from "@/features/client-portal/services/organizer-identity-information-service"

import type {
  SaveOrganizerIdentityInformationRequest,
  SaveOrganizerIdentityInformationResult,
} from "@/features/client-portal/services/organizer-identity-information-service"

import type {
  OrganizerIdentityInformation,
} from "@/features/client-portal/types/organizer-identity-information.types"

interface UseOrganizerIdentityInformationResult {
  identityInformation:
    OrganizerIdentityInformation | null

  isLoading: boolean
  isSaving: boolean

  errorMessage: string | null
  saveMessage: string | null

  refresh: () => Promise<void>

  save: (
    request:
      SaveOrganizerIdentityInformationRequest,
  ) => Promise<SaveOrganizerIdentityInformationResult>
}

export function useOrganizerIdentityInformation(
  organizerId: string,
): UseOrganizerIdentityInformationResult {
  const [
    identityInformation,
    setIdentityInformation,
  ] =
    useState<OrganizerIdentityInformation | null>(
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

  const loadIdentityInformation =
    useCallback(async () => {
      const normalizedOrganizerId =
        organizerId.trim()

      if (!normalizedOrganizerId) {
        setIdentityInformation(null)
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
          await getOrganizerIdentityInformation(
            normalizedOrganizerId,
          )

        setIdentityInformation(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load organizer identity information:",
          error,
        )

        setIdentityInformation(null)

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load identity information.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [organizerId])

  useEffect(() => {
    if (!organizerId.trim()) {
      return
    }

    void loadIdentityInformation()
  }, [
    organizerId,
    loadIdentityInformation,
  ])

  const save =
    useCallback(
      async (
        request:
          SaveOrganizerIdentityInformationRequest,
      ) => {
        try {
          setIsSaving(true)
          setErrorMessage(null)
          setSaveMessage(null)

          const result =
            await saveOrganizerIdentityInformation(
              request,
            )

          setSaveMessage(
            result.sectionStatus ===
              "completed"
              ? "Identity information saved and completed."
              : "Identity information saved as a draft.",
          )

          await loadIdentityInformation()

          return result
        } catch (error) {
          console.error(
            "Unable to save organizer identity information:",
            error,
          )

          const message =
            error instanceof Error
              ? error.message
              : "Unable to save identity information."

          setErrorMessage(message)

          throw error
        } finally {
          setIsSaving(false)
        }
      },
      [loadIdentityInformation],
    )

  return {
    identityInformation,
    isLoading,
    isSaving,
    errorMessage,
    saveMessage,
    refresh:
      loadIdentityInformation,
    save,
  }
}