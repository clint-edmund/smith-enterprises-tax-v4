import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getReviewChecklist,
  setReviewChecklistItem,
} from "@/features/organizer-review/services/review-checklist-service"

import type {
  GetReviewChecklistRequest,
  ReviewChecklist,
} from "@/features/organizer-review/types/review-checklist.types"

interface UseReviewChecklistResult {
  checklist:
    ReviewChecklist | null
  isLoading: boolean
  savingItemId:
    string | null
  errorMessage:
    string | null
  successMessage:
    string | null
  refresh: () => Promise<void>
  setItemCompleted: (
    itemId: string,
    isCompleted: boolean,
  ) => Promise<boolean>
  clearMessages: () => void
}

export function useReviewChecklist(
  request:
    GetReviewChecklistRequest,
): UseReviewChecklistResult {
  const [
    checklist,
    setChecklist,
  ] =
    useState<ReviewChecklist | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    savingItemId,
    setSavingItemId,
  ] =
    useState<string | null>(
      null,
    )

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
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getReviewChecklist(
            request,
          )

        setChecklist(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load the review checklist:",
          error,
        )

        setChecklist(null)

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the review checklist.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [
      request.organizerId,
      request.sectionKey,
      request.subjectId,
      request.subjectType,
    ])

  useEffect(() => {
    void refresh()
  }, [
    refresh,
  ])

  const setItemCompleted =
    useCallback(
      async (
        itemId: string,
        isCompleted: boolean,
      ): Promise<boolean> => {
        try {
          setSavingItemId(
            itemId,
          )
          clearMessages()

          await setReviewChecklistItem({
            ...request,
            itemId,
            isCompleted,
          })

          await refresh()

          setSuccessMessage(
            isCompleted
              ? "Checklist item completed."
              : "Checklist item reopened.",
          )

          return true
        } catch (error) {
          console.error(
            "Unable to update the review checklist:",
            error,
          )

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to update the review checklist.",
          )

          return false
        } finally {
          setSavingItemId(
            null,
          )
        }
      },
      [
        clearMessages,
        refresh,
        request.organizerId,
        request.sectionKey,
        request.subjectId,
        request.subjectType,
      ],
    )

  return {
    checklist,
    isLoading,
    savingItemId,
    errorMessage,
    successMessage,
    refresh,
    setItemCompleted,
    clearMessages,
  }
}
