import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getClientDashboard,
  getClientDashboardErrorMessage,
} from "@/features/client-portal/services/client-dashboard-service"

import type {
  ClientDashboard,
} from "@/features/client-portal/types/client-dashboard.types"

interface UseClientDashboardResult {
  dashboard: ClientDashboard | null

  isLoading: boolean

  isRefreshing: boolean

  error: string | null

  refresh: () => Promise<void>
}

export function useClientDashboard():
UseClientDashboardResult {
  const [
    dashboard,
    setDashboard,
  ] = useState<ClientDashboard | null>(
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
    error,
    setError,
  ] = useState<string | null>(
    null,
  )

  const loadDashboard =
    useCallback(
      async (
        isManualRefresh = false,
      ) => {
        if (isManualRefresh) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        setError(null)

        try {
          const nextDashboard =
            await getClientDashboard()

          setDashboard(nextDashboard)
        } catch (loadError) {
          setError(
            getClientDashboardErrorMessage(
              loadError,
            ),
          )
        } finally {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      },
      [],
    )

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const refresh =
    useCallback(async () => {
      await loadDashboard(true)
    }, [loadDashboard])

  return {
    dashboard,
    isLoading,
    isRefreshing,
    error,
    refresh,
  }
}