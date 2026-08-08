import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getDocumentAnalysisJobs,
  queueDocumentAnalysis,
} from "@/features/organizer-review/services/document-analysis-service"

import type {
  DocumentAnalysisJob,
  QueueDocumentAnalysisRequest,
} from "@/features/organizer-review/types/document-analysis.types"

interface UseDocumentAnalysisResult {
  jobs:
    DocumentAnalysisJob[]
  latestJob:
    DocumentAnalysisJob | null
  isLoading: boolean
  isQueueing: boolean
  errorMessage:
    string | null
  successMessage:
    string | null
  refresh: () => Promise<void>
  queueAnalysis: (
    request:
      Omit<
        QueueDocumentAnalysisRequest,
        "documentId"
      >,
  ) => Promise<boolean>
  clearMessages: () => void
}

export function useDocumentAnalysis(
  documentId: string | null,
): UseDocumentAnalysisResult {
  const [
    jobs,
    setJobs,
  ] =
    useState<
      DocumentAnalysisJob[]
    >([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(false)

  const [
    isQueueing,
    setIsQueueing,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    )

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null,
    )

  const clearMessages =
    useCallback(() => {
      setErrorMessage(null)
      setSuccessMessage(null)
    }, [])

  const refresh =
    useCallback(async () => {
      if (!documentId) {
        setJobs([])
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getDocumentAnalysisJobs(
            documentId,
          )

        setJobs(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load document analysis history:",
          error,
        )

        setJobs([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load document analysis history.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [
      documentId,
    ])

  useEffect(() => {
    void refresh()
  }, [
    refresh,
  ])

  const queueAnalysis =
    useCallback(
      async (
        request:
          Omit<
            QueueDocumentAnalysisRequest,
            "documentId"
          >,
      ): Promise<boolean> => {
        if (!documentId) {
          return false
        }

        try {
          setIsQueueing(true)
          clearMessages()

          await queueDocumentAnalysis({
            documentId,
            ...request,
          })

          await refresh()

          setSuccessMessage(
            "Document analysis was queued.",
          )

          return true
        } catch (error) {
          console.error(
            "Unable to queue document analysis:",
            error,
          )

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to queue document analysis.",
          )

          return false
        } finally {
          setIsQueueing(false)
        }
      },
      [
        clearMessages,
        documentId,
        refresh,
      ],
    )

  return {
    jobs,
    latestJob:
      jobs[0] ??
      null,
    isLoading,
    isQueueing,
    errorMessage,
    successMessage,
    refresh,
    queueAnalysis,
    clearMessages,
  }
}
