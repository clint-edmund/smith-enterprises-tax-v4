import { useEffect, useState } from "react"

import {
  listDocumentReviewers,
} from "@/features/documents/services/document-service"

import type {
  DocumentReviewer,
} from "@/features/documents/types/document.types"

export function useDocumentReviewers() {
  const [reviewers, setReviewers] =
    useState<DocumentReviewer[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  async function refresh() {
    setIsLoading(true)
    setError(null)

    try {
      const data =
        await listDocumentReviewers()

      setReviewers(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reviewers.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  return {
    reviewers,
    isLoading,
    error,
    refresh,
  }
}