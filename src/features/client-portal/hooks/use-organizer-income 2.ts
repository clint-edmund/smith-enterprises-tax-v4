import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  createOrganizerIncomeSource,
  deleteOrganizerIncomeSource,
  getOrganizerIncomeSources,
  getOrganizerIncomeW2Details,
  saveOrganizerIncomeW2Details,
  updateOrganizerIncomeSource,
} from "@/features/client-portal/services/organizer-income-service"

import type {
  DeleteIncomeSourceResponse,
} from "@/features/client-portal/services/organizer-income-service"

import type {
  CreateIncomeSourceRequest,
  DeleteIncomeSourceRequest,
  OrganizerIncomeSource,
  OrganizerIncomeW2Details,
  SaveIncomeW2DetailsRequest,
  SaveIncomeW2DetailsResponse,
  UpdateIncomeSourceRequest,
} from "@/features/client-portal/types/organizer-income.types"

interface UseOrganizerIncomeResult {
  incomeSources:
    OrganizerIncomeSource[]

  selectedW2Details:
    OrganizerIncomeW2Details | null

  isLoading: boolean

  isLoadingW2: boolean

  isSaving: boolean

  isSavingW2: boolean

  isDeleting: boolean

  errorMessage:
    string | null

  saveMessage:
    string | null

  refresh:
    () => Promise<void>

  createIncomeSource:
    (
      request:
        CreateIncomeSourceRequest,
    ) => Promise<OrganizerIncomeSource>

  updateIncomeSource:
    (
      request:
        UpdateIncomeSourceRequest,
    ) => Promise<OrganizerIncomeSource>

  deleteIncomeSource:
    (
      request:
        DeleteIncomeSourceRequest,
    ) => Promise<DeleteIncomeSourceResponse>

  loadW2Details:
    (
      incomeSourceId: string,
    ) => Promise<OrganizerIncomeW2Details>

  saveW2Details:
    (
      request:
        SaveIncomeW2DetailsRequest,
    ) => Promise<SaveIncomeW2DetailsResponse>

  clearSelectedW2Details:
    () => void

  clearMessages:
    () => void
}

export function useOrganizerIncome(
  organizerId: string,
): UseOrganizerIncomeResult {
  const [
    incomeSources,
    setIncomeSources,
  ] =
    useState<OrganizerIncomeSource[]>(
      [],
    )

  const [
    selectedW2Details,
    setSelectedW2Details,
  ] =
    useState<OrganizerIncomeW2Details | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isLoadingW2,
    setIsLoadingW2,
  ] = useState(false)

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    isSavingW2,
    setIsSavingW2,
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

  const clearSelectedW2Details =
    useCallback(() => {
      setSelectedW2Details(
        null,
      )
    }, [])

  const refresh =
    useCallback(async () => {
      const normalizedOrganizerId =
        organizerId.trim()

      if (!normalizedOrganizerId) {
        setIncomeSources([])
        setSelectedW2Details(null)
        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getOrganizerIncomeSources(
            normalizedOrganizerId,
          )

        setIncomeSources(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load organizer income sources:",
          error,
        )

        setIncomeSources([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Income sources could not be loaded.",
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

  async function createIncomeSource(
    request:
      CreateIncomeSourceRequest,
  ): Promise<OrganizerIncomeSource> {
    try {
      setIsSaving(true)
      clearMessages()

      const result =
        await createOrganizerIncomeSource(
          request,
        )

      await refresh()

      setSaveMessage(
        `${result.payerName} was added successfully.`,
      )

      return result
    } catch (error) {
      console.error(
        "Unable to create organizer income source:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "The income source could not be created."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function updateIncomeSource(
    request:
      UpdateIncomeSourceRequest,
  ): Promise<OrganizerIncomeSource> {
    try {
      setIsSaving(true)
      clearMessages()

      const result =
        await updateOrganizerIncomeSource(
          request,
        )

      await refresh()

      setSaveMessage(
        `${result.payerName} was updated successfully.`,
      )

      return result
    } catch (error) {
      console.error(
        "Unable to update organizer income source:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "The income source could not be updated."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteIncomeSource(
    request:
      DeleteIncomeSourceRequest,
  ): Promise<DeleteIncomeSourceResponse> {
    try {
      setIsDeleting(true)
      clearMessages()

      const result =
        await deleteOrganizerIncomeSource(
          request,
        )

      setSelectedW2Details(
        (currentDetails) =>
          currentDetails?.incomeSourceId ===
          request.incomeSourceId
            ? null
            : currentDetails,
      )

      await refresh()

      setSaveMessage(
        `${result.payerName} was deleted successfully.`,
      )

      return result
    } catch (error) {
      console.error(
        "Unable to delete organizer income source:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "The income source could not be deleted."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  async function loadW2Details(
    incomeSourceId: string,
  ): Promise<OrganizerIncomeW2Details> {
    const normalizedOrganizerId =
      organizerId.trim()

    const normalizedIncomeSourceId =
      incomeSourceId.trim()

    if (!normalizedOrganizerId) {
      throw new Error(
        "An organizer identifier is required.",
      )
    }

    if (!normalizedIncomeSourceId) {
      throw new Error(
        "An income source identifier is required.",
      )
    }

    try {
      setIsLoadingW2(true)
      clearMessages()

      const result =
        await getOrganizerIncomeW2Details(
          normalizedOrganizerId,
          normalizedIncomeSourceId,
        )

      setSelectedW2Details(
        result,
      )

      return result
    } catch (error) {
      console.error(
        "Unable to load organizer W-2 details:",
        error,
      )

      setSelectedW2Details(
        null,
      )

      const message =
        error instanceof Error
          ? error.message
          : "The W-2 details could not be loaded."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsLoadingW2(false)
    }
  }

  async function saveW2Details(
    request:
      SaveIncomeW2DetailsRequest,
  ): Promise<SaveIncomeW2DetailsResponse> {
    try {
      setIsSavingW2(true)
      clearMessages()

      const result =
        await saveOrganizerIncomeW2Details(
          request,
        )

      setSelectedW2Details(
        result.w2Details,
      )

      await refresh()

      setSaveMessage(
        `${result.incomeSource.payerName} W-2 details were saved successfully.`,
      )

      return result
    } catch (error) {
      console.error(
        "Unable to save organizer W-2 details:",
        error,
      )

      const message =
        error instanceof Error
          ? error.message
          : "The W-2 details could not be saved."

      setErrorMessage(
        message,
      )

      throw error
    } finally {
      setIsSavingW2(false)
    }
  }

  return {
    incomeSources,
    selectedW2Details,
    isLoading,
    isLoadingW2,
    isSaving,
    isSavingW2,
    isDeleting,
    errorMessage,
    saveMessage,
    refresh,
    createIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    loadW2Details,
    saveW2Details,
    clearSelectedW2Details,
    clearMessages,
  }
}