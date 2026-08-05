import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getStaffDependentReview,
  markDependentReviewComplete,
  markDependentReviewNeedsFollowUp,
  returnDependentToClient,
  saveDependentReviewNotes,
} from "@/features/organizer-review/services/staff-dependent-review-service"

import type {
  StaffDependentReview,
} from "@/features/organizer-review/types/staff-dependent-review.types"

interface UseStaffDependentReviewResult {
  review:
    StaffDependentReview | null
  isLoading: boolean
  isSaving: boolean
  errorMessage:
    string | null
  successMessage:
    string | null
  refresh: () => Promise<void>
  saveNotes: (
    internalNotes: string,
  ) => Promise<boolean>
  markReviewed:
    () => Promise<boolean>
  markNeedsFollowUp: (
    internalNotes: string,
  ) => Promise<boolean>
  returnToClient: (
    internalNotes: string,
  ) => Promise<boolean>
  clearMessages: () => void
}

export function useStaffDependentReview(
  dependentId: string,
): UseStaffDependentReviewResult {
  const [
    review,
    setReview,
  ] =
    useState<StaffDependentReview | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSaving,
    setIsSaving,
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

  const normalizedDependentId =
    dependentId.trim()

  const clearMessages =
    useCallback(() => {
      setErrorMessage(null)
      setSuccessMessage(null)
    }, [])

  const refresh =
    useCallback(async () => {
      if (
        !normalizedDependentId
      ) {
        setReview(null)

        setErrorMessage(
          "A dependent identifier is required.",
        )

        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getStaffDependentReview(
            normalizedDependentId,
          )

        setReview(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load the staff dependent review:",
          error,
        )

        setReview(null)

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the dependent review.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [
      normalizedDependentId,
    ])

  useEffect(() => {
    void refresh()
  }, [
    refresh,
  ])

  const runAction =
    useCallback(
      async (
        action:
          () => Promise<StaffDependentReview>,
        successText: string,
      ): Promise<boolean> => {
        try {
          setIsSaving(true)
          clearMessages()

          const result =
            await action()

          setReview(
            result,
          )

          setSuccessMessage(
            successText,
          )

          return true
        } catch (error) {
          console.error(
            "Unable to update the staff dependent review:",
            error,
          )

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to update the dependent review.",
          )

          return false
        } finally {
          setIsSaving(false)
        }
      },
      [
        clearMessages,
      ],
    )

  const saveNotes =
    useCallback(
      async (
        internalNotes: string,
      ) =>
        runAction(
          () =>
            saveDependentReviewNotes({
              dependentId:
                normalizedDependentId,

              internalNotes,
            }),
          "Staff notes saved.",
        ),
      [
        normalizedDependentId,
        runAction,
      ],
    )

  const markReviewed =
    useCallback(
      async () =>
        runAction(
          () =>
            markDependentReviewComplete(
              normalizedDependentId,
            ),
          "Dependent marked as reviewed.",
        ),
      [
        normalizedDependentId,
        runAction,
      ],
    )

  const markNeedsFollowUp =
    useCallback(
      async (
        internalNotes: string,
      ) =>
        runAction(
          () =>
            markDependentReviewNeedsFollowUp({
              dependentId:
                normalizedDependentId,

              internalNotes,
            }),
          "Dependent marked as needing follow-up.",
        ),
      [
        normalizedDependentId,
        runAction,
      ],
    )

  const returnToClient =
    useCallback(
      async (
        internalNotes: string,
      ) =>
        runAction(
          () =>
            returnDependentToClient({
              dependentId:
                normalizedDependentId,

              internalNotes,
            }),
          "Dependent returned to the client for correction.",
        ),
      [
        normalizedDependentId,
        runAction,
      ],
    )

  return {
    review,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    refresh,
    saveNotes,
    markReviewed,
    markNeedsFollowUp,
    returnToClient,
    clearMessages,
  }
}
