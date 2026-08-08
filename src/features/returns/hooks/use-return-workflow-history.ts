import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getReturnWorkflowHistory,
} from "@/features/returns/services/return-workflow-history-service"
import type {
  ReturnWorkflowHistoryItem,
} from "@/features/returns/types/return-workflow-history.types"

interface UseReturnWorkflowHistoryResult {
  events: ReturnWorkflowHistoryItem[]
  isLoading: boolean
  errorMessage: string | null
  refresh: () => Promise<void>
}

export function useReturnWorkflowHistory(
  taxReturnId: string,
): UseReturnWorkflowHistoryResult {
  const [
    events,
    setEvents,
  ] = useState<ReturnWorkflowHistoryItem[]>([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  const loadHistory =
    useCallback(async () => {
      const normalizedReturnId =
        taxReturnId.trim()

      if (!normalizedReturnId) {
        setEvents([])
        setErrorMessage(null)
        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const history =
          await getReturnWorkflowHistory(
            normalizedReturnId,
          )

        setEvents(history)
      } catch (error) {
        console.error(
          "Unable to load return workflow history:",
          error,
        )

        setEvents([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load workflow history.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [taxReturnId])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  return {
    events,
    isLoading,
    errorMessage,
    refresh: loadHistory,
  }
}