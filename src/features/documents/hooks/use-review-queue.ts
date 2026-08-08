import { useCallback, useEffect, useState } from "react"

import {
  listMyAssignedDocumentReviews,
} from "@/features/documents/services/review-queue-service"

import type {
  DocumentReviewQueueData,
} from "@/features/documents/types/review-queue.types"

export function useReviewQueue() {
  const [
    queue,
    setQueue,
  ] =
    useState<DocumentReviewQueueData>({
      items: [],
      summary: {
        total: 0,
        overdue: 0,
        dueToday: 0,
        dueThisWeek: 0,
        upcoming: 0,
        noDueDate: 0,
      },
    })

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState<string | null>(null)

  const refresh =
    useCallback(async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data =
          await listMyAssignedDocumentReviews()

        setQueue(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load review queue.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    queue,
    isLoading,
    error,
    refresh,
  }
}