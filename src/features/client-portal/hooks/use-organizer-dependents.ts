import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  addOrganizerDependent,
  deleteOrganizerDependent,
  getOrganizerDependents,
  updateOrganizerDependent,
} from "@/features/client-portal/services/organizer-dependent-service"

import type {
  AddOrganizerDependentRequest,
  AddOrganizerDependentResponse,
  OrganizerDependent,
  DeleteOrganizerDependentRequest,
  DeleteOrganizerDependentResponse,
  UpdateOrganizerDependentRequest,
  UpdateOrganizerDependentResponse,
} from "@/features/client-portal/types/organizer-dependent.types"

interface UseOrganizerDependentsResult {
  dependents:
    OrganizerDependent[]

  isLoading: boolean

  isSaving: boolean

  isDeleting: boolean

  errorMessage:
    string | null

  saveMessage:
    string | null

  refresh:
    () => Promise<void>

  addDependent:
    (
      request:
        AddOrganizerDependentRequest,
    ) => Promise<AddOrganizerDependentResponse>

  deleteDependent:
    (
      request:
        DeleteOrganizerDependentRequest,
    ) => Promise<DeleteOrganizerDependentResponse>

  updateDependent:
    (
      request:
        UpdateOrganizerDependentRequest,
    ) => Promise<UpdateOrganizerDependentResponse>

  clearMessages:
    () => void
}

export function useOrganizerDependents(
  organizerId: string,
): UseOrganizerDependentsResult {
  const [
    dependents,
    setDependents,
  ] =
    useState<OrganizerDependent[]>(
      [],
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
    isDeleting,
    setIsDeleting,
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

  const clearMessages =
    useCallback(() => {
      setErrorMessage(null)
      setSaveMessage(null)
    }, [])

  const refresh =
    useCallback(async () => {
      const normalizedOrganizerId =
        organizerId.trim()

      if (!normalizedOrganizerId) {
        setDependents([])
        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getOrganizerDependents(
            normalizedOrganizerId,
          )

        setDependents(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load organizer dependents:",
          error,
        )

        setDependents([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Dependents could not be loaded.",
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

  async function addDependent(
    request:
      AddOrganizerDependentRequest,
  ): Promise<AddOrganizerDependentResponse> {
    try {
      setIsSaving(true)
      clearMessages()

      const result =
        await addOrganizerDependent(
          request,
        )

      await refresh()

      setSaveMessage(
        `${result.firstName} ${result.lastName} was added successfully.`,
      )

      return result
    } catch (error) {
      console.error(
        "Unable to add organizer dependent:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "The dependent could not be added."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function updateDependent(
    request:
      UpdateOrganizerDependentRequest,
  ): Promise<UpdateOrganizerDependentResponse> {
    try {
      setIsSaving(true)
      clearMessages()

      const result =
        await updateOrganizerDependent(
          request,
        )

      await refresh()

      setSaveMessage(
        `${result.firstName} ${result.lastName} was updated successfully.`,
      )

      return result
    } catch (error) {
      console.error(
        "Unable to update organizer dependent:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "The dependent could not be updated."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteDependent(
    request:
      DeleteOrganizerDependentRequest,
  ): Promise<DeleteOrganizerDependentResponse> {
    try {
      setIsDeleting(true)
      clearMessages()

      const result =
        await deleteOrganizerDependent(
          request,
        )

      await refresh()

      setSaveMessage(
        `${result.dependentName} was deleted successfully.`,
      )

      return result
    } catch (error) {
      console.error(
        "Unable to delete organizer dependent:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "The dependent could not be deleted."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    dependents,
    isLoading,
    isSaving,
    isDeleting,
    errorMessage,
    saveMessage,
    refresh,
    addDependent,
    updateDependent,
    deleteDependent,
    clearMessages,
  }
}