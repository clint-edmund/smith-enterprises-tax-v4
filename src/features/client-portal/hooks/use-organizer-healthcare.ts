import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  createOrganizerHealthcareCoverage,
  deleteOrganizerHealthcareCoverage,
  getOrganizerHealthcareCoverages,
  updateOrganizerHealthcareCoverage,
} from "@/features/client-portal/services/organizer-healthcare-service"

import type {
  CreateOrganizerHealthcareCoverageRequest,
  DeleteOrganizerHealthcareCoverageRequest,
  OrganizerHealthcareCoverage,
  UpdateOrganizerHealthcareCoverageRequest,
} from "@/features/client-portal/types/organizer-healthcare.types"

interface UseOrganizerHealthcareResult {
  coverages:
    OrganizerHealthcareCoverage[]

  isLoading: boolean

  isSaving: boolean

  isDeleting: boolean

  errorMessage:
    string | null

  saveMessage:
    string | null

  refresh:
    () => Promise<void>

  createCoverage:
    (
      request:
        CreateOrganizerHealthcareCoverageRequest,
    ) => Promise<OrganizerHealthcareCoverage>

  updateCoverage:
    (
      request:
        UpdateOrganizerHealthcareCoverageRequest,
    ) => Promise<OrganizerHealthcareCoverage>

  deleteCoverage:
    (
      request:
        DeleteOrganizerHealthcareCoverageRequest,
    ) => Promise<void>

  clearMessages:
    () => void
}

export function useOrganizerHealthcare(
  organizerId: string,
): UseOrganizerHealthcareResult {
  const [
    coverages,
    setCoverages,
  ] =
    useState<
      OrganizerHealthcareCoverage[]
    >([])

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true)

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false)

  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    )

  const [
    saveMessage,
    setSaveMessage,
  ] =
    useState<string | null>(
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
        setCoverages([])
        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getOrganizerHealthcareCoverages(
            normalizedOrganizerId,
          )

        setCoverages(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load organizer healthcare coverage:",
          error,
        )

        setCoverages([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Healthcare coverage could not be loaded.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [
      organizerId,
    ])

  useEffect(() => {
    void refresh()
  }, [
    refresh,
  ])

  async function createCoverage(
    request:
      CreateOrganizerHealthcareCoverageRequest,
  ): Promise<OrganizerHealthcareCoverage> {
    try {
      setIsSaving(true)
      clearMessages()

      const result =
        await createOrganizerHealthcareCoverage(
          request,
        )

      await refresh()

      setSaveMessage(
        `${result.providerName} coverage was added successfully.`,
      )

      return result
    } catch (error) {
      console.error(
        "Unable to create healthcare coverage:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "Healthcare coverage could not be created."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function updateCoverage(
    request:
      UpdateOrganizerHealthcareCoverageRequest,
  ): Promise<OrganizerHealthcareCoverage> {
    try {
      setIsSaving(true)
      clearMessages()

      const result =
        await updateOrganizerHealthcareCoverage(
          request,
        )

      await refresh()

      setSaveMessage(
        `${result.providerName} coverage was updated successfully.`,
      )

      return result
    } catch (error) {
      console.error(
        "Unable to update healthcare coverage:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "Healthcare coverage could not be updated."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteCoverage(
    request:
      DeleteOrganizerHealthcareCoverageRequest,
  ): Promise<void> {
    try {
      setIsDeleting(true)
      clearMessages()

      const coverage =
        coverages.find(
          (item) =>
            item.coverageId ===
            request.coverageId,
        )

      await deleteOrganizerHealthcareCoverage(
        request,
      )

      await refresh()

      setSaveMessage(
        coverage
          ? `${coverage.providerName} coverage was deleted successfully.`
          : "Healthcare coverage was deleted successfully.",
      )
    } catch (error) {
      console.error(
        "Unable to delete healthcare coverage:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "Healthcare coverage could not be deleted."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    coverages,
    isLoading,
    isSaving,
    isDeleting,
    errorMessage,
    saveMessage,
    refresh,
    createCoverage,
    updateCoverage,
    deleteCoverage,
    clearMessages,
  }
}