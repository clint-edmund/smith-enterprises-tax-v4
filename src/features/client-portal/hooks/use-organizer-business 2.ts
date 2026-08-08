import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  createOrganizerBusiness,
  deleteOrganizerBusiness,
  getOrganizerBusinessResponse,
  getOrganizerBusinesses,
  saveOrganizerBusinessActivity,
  updateOrganizerBusiness,
} from "@/features/client-portal/services/organizer-business-service"

import type {
  DeleteOrganizerBusinessRequest,
  OrganizerBusiness,
  OrganizerBusinessResponse,
  SaveOrganizerBusinessActivityRequest,
  SaveOrganizerBusinessRequest,
  UpdateOrganizerBusinessRequest,
} from "@/features/client-portal/types/organizer-business.types"

interface UseOrganizerBusinessResult {
  businessResponse:
    OrganizerBusinessResponse | null

  businesses:
    OrganizerBusiness[]

  isLoading: boolean
  isSavingActivity: boolean
  isSavingBusiness: boolean
  isDeleting: boolean

  errorMessage:
    string | null

  saveMessage:
    string | null

  refresh:
    () => Promise<void>

  saveBusinessActivity:
    (
      request:
        SaveOrganizerBusinessActivityRequest,
    ) => Promise<OrganizerBusinessResponse>

  createBusiness:
    (
      request:
        SaveOrganizerBusinessRequest,
    ) => Promise<OrganizerBusiness>

  updateBusiness:
    (
      request:
        UpdateOrganizerBusinessRequest,
    ) => Promise<OrganizerBusiness>

  deleteBusiness:
    (
      request:
        DeleteOrganizerBusinessRequest,
    ) => Promise<void>

  clearMessages:
    () => void
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return error instanceof Error
    ? error.message
    : fallbackMessage
}

export function useOrganizerBusiness(
  organizerId: string,
): UseOrganizerBusinessResult {
  const [
    businessResponse,
    setBusinessResponse,
  ] =
    useState<
      OrganizerBusinessResponse | null
    >(null)

  const [
    businesses,
    setBusinesses,
  ] =
    useState<OrganizerBusiness[]>(
      [],
    )

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true)

  const [
    isSavingActivity,
    setIsSavingActivity,
  ] =
    useState(false)

  const [
    isSavingBusiness,
    setIsSavingBusiness,
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
        setBusinessResponse(null)
        setBusinesses([])
        setErrorMessage(null)
        setSaveMessage(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const [
          nextBusinessResponse,
          nextBusinesses,
        ] = await Promise.all([
          getOrganizerBusinessResponse(
            normalizedOrganizerId,
          ),

          getOrganizerBusinesses(
            normalizedOrganizerId,
          ),
        ])

        setBusinessResponse(
          nextBusinessResponse,
        )

        setBusinesses(
          nextBusinesses,
        )
      } catch (error) {
        console.error(
          "Unable to load the Business organizer:",
          error,
        )

        setBusinessResponse(null)
        setBusinesses([])

        setErrorMessage(
          getErrorMessage(
            error,
            "Unable to load the Business organizer.",
          ),
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

  const saveBusinessActivity =
    useCallback(
      async (
        request:
          SaveOrganizerBusinessActivityRequest,
      ): Promise<OrganizerBusinessResponse> => {
        try {
          setIsSavingActivity(true)
          setErrorMessage(null)
          setSaveMessage(null)

          const savedResponse =
            await saveOrganizerBusinessActivity(
              request,
            )

          setBusinessResponse(
            savedResponse,
          )

          setSaveMessage(
            savedResponse
              .hasBusinessActivity
              ? "Business activity selection saved."
              : "No business or self-employment activity was reported.",
          )

          return savedResponse
        } catch (error) {
          console.error(
            "Unable to save the Business activity response:",
            error,
          )

          const message =
            getErrorMessage(
              error,
              "Unable to save the Business activity response.",
            )

          setErrorMessage(
            message,
          )

          throw error
        } finally {
          setIsSavingActivity(false)
        }
      },
      [],
    )

  const createBusiness =
    useCallback(
      async (
        request:
          SaveOrganizerBusinessRequest,
      ): Promise<OrganizerBusiness> => {
        try {
          setIsSavingBusiness(true)
          setErrorMessage(null)
          setSaveMessage(null)

          const savedBusiness =
            await createOrganizerBusiness(
              request,
            )

          setBusinesses(
            (currentBusinesses) => [
              ...currentBusinesses,
              savedBusiness,
            ].sort(
              (
                firstBusiness,
                secondBusiness,
              ) =>
                firstBusiness
                  .displayOrder -
                secondBusiness
                  .displayOrder,
            ),
          )

          setBusinessResponse(
            (currentResponse) => ({
              organizerId:
                request.organizerId,

              hasBusinessActivity:
                true,

              createdAt:
                currentResponse
                  ?.createdAt ??
                savedBusiness
                  .createdAt,

              updatedAt:
                savedBusiness
                  .updatedAt,
            }),
          )

          setSaveMessage(
            "Business information saved.",
          )

          return savedBusiness
        } catch (error) {
          console.error(
            "Unable to create the Business organizer record:",
            error,
          )

          const message =
            getErrorMessage(
              error,
              "Unable to save the Business organizer record.",
            )

          setErrorMessage(
            message,
          )

          throw error
        } finally {
          setIsSavingBusiness(false)
        }
      },
      [],
    )

  const updateBusiness =
    useCallback(
      async (
        request:
          UpdateOrganizerBusinessRequest,
      ): Promise<OrganizerBusiness> => {
        try {
          setIsSavingBusiness(true)
          setErrorMessage(null)
          setSaveMessage(null)

          const savedBusiness =
            await updateOrganizerBusiness(
              request,
            )

          setBusinesses(
            (currentBusinesses) =>
              currentBusinesses.map(
                (business) =>
                  business.id ===
                  savedBusiness.id
                    ? savedBusiness
                    : business,
              ),
          )

          setSaveMessage(
            "Business information updated.",
          )

          return savedBusiness
        } catch (error) {
          console.error(
            "Unable to update the Business organizer record:",
            error,
          )

          const message =
            getErrorMessage(
              error,
              "Unable to update the Business organizer record.",
            )

          setErrorMessage(
            message,
          )

          throw error
        } finally {
          setIsSavingBusiness(false)
        }
      },
      [],
    )

  const deleteBusiness =
    useCallback(
      async (
        request:
          DeleteOrganizerBusinessRequest,
      ): Promise<void> => {
        try {
          setIsDeleting(true)
          setErrorMessage(null)
          setSaveMessage(null)

          await deleteOrganizerBusiness(
            request,
          )

          setBusinesses(
            (currentBusinesses) =>
              currentBusinesses.filter(
                (business) =>
                  business.id !==
                  request.businessId,
              ),
          )

          setSaveMessage(
            "Business record deleted.",
          )
        } catch (error) {
          console.error(
            "Unable to delete the Business organizer record:",
            error,
          )

          const message =
            getErrorMessage(
              error,
              "Unable to delete the Business organizer record.",
            )

          setErrorMessage(
            message,
          )

          throw error
        } finally {
          setIsDeleting(false)
        }
      },
      [],
    )

  return {
    businessResponse,
    businesses,

    isLoading,
    isSavingActivity,
    isSavingBusiness,
    isDeleting,

    errorMessage,
    saveMessage,

    refresh,
    saveBusinessActivity,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    clearMessages,
  }
}
