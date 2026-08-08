import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getClientOrganizerWorkspace,
} from "@/features/clients/services/client-organizer-workspace-service"

import type {
  ClientOrganizerWorkspace,
} from "@/features/clients/types/client-organizer-workspace.types"

interface UseClientOrganizerWorkspaceResult {
  workspace:
    ClientOrganizerWorkspace | null
  isLoading: boolean
  isRefreshing: boolean
  errorMessage: string | null
  refresh: () => Promise<void>
}

export function useClientOrganizerWorkspace(
  clientId: string,
): UseClientOrganizerWorkspaceResult {
  const [
    workspace,
    setWorkspace,
  ] =
    useState<ClientOrganizerWorkspace | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    )

  const normalizedClientId =
    clientId.trim()

  const loadWorkspace =
    useCallback(
      async (
        refreshOnly:
          boolean,
      ) => {
        if (!normalizedClientId) {
          setWorkspace(null)
          setErrorMessage(null)
          setIsLoading(false)
          setIsRefreshing(false)

          return
        }

        if (refreshOnly) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        setErrorMessage(null)

        try {
          const result =
            await getClientOrganizerWorkspace(
              normalizedClientId,
            )

          setWorkspace(
            result,
          )
        } catch (error) {
          console.error(
            "Unable to load the client Organizer Workspace:",
            error,
          )

          setWorkspace(null)

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load the Organizer Workspace.",
          )
        } finally {
          if (refreshOnly) {
            setIsRefreshing(false)
          } else {
            setIsLoading(false)
          }
        }
      },
      [
        normalizedClientId,
      ],
    )

  useEffect(() => {
    void loadWorkspace(
      false,
    )
  }, [
    loadWorkspace,
  ])

  const refresh =
    useCallback(
      async () => {
        await loadWorkspace(
          true,
        )
      },
      [
        loadWorkspace,
      ],
    )

  return {
    workspace,
    isLoading,
    isRefreshing,
    errorMessage,
    refresh,
  }
}
