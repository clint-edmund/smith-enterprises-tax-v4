import {
  useCallback,
  useState,
} from "react"

import {
  addReviewWorkflowEvent,
} from "@/features/organizer-review/services/review-workflow-event-service"

import type {
  ReviewActionKey,
} from "@/features/organizer-review/types/review-action.types"

interface UseReviewActionRunnerOptions {
  organizerId: string
  sectionKey:
    | "income"
    | "dependents"
    | "healthcare"
    | "deductions"
    | "credits"
    | "business"
    | "investments"
    | "final_review"
  subjectType:
    | "income_source"
    | "dependent"
    | "healthcare_record"
    | "deduction"
    | "credit"
    | "business_record"
    | "investment_record"
    | "organizer"
  subjectId: string
  subjectLabel: string
  currentStatus: string
  markReviewed:
    () => Promise<boolean>
  markNeedsFollowUp:
    (
      explanation: string,
    ) => Promise<boolean>
  returnToClient:
    (
      explanation: string,
    ) => Promise<boolean>
}

interface UseReviewActionRunnerResult {
  activeAction:
    ReviewActionKey | null
  isSaving: boolean
  errorMessage:
    string | null
  successMessage:
    string | null
  timelineVersion: number
  openAction: (
    action:
      ReviewActionKey,
  ) => void
  closeAction: () => void
  runAction: (
    action:
      ReviewActionKey,
    explanation: string,
  ) => Promise<boolean>
  clearMessages: () => void
}

function getSuccessMessage(
  action:
    ReviewActionKey,
): string {
  switch (action) {
    case "mark_reviewed":
      return "Review item marked as reviewed."

    case "needs_follow_up":
      return "Review item marked as needing follow-up."

    case "return_to_client":
      return "Review item returned to the client."
  }
}

function getEventType(
  action:
    ReviewActionKey,
) {
  switch (action) {
    case "mark_reviewed":
      return "marked_reviewed" as const

    case "needs_follow_up":
      return "needs_follow_up" as const

    case "return_to_client":
      return "returned_to_client" as const
  }
}

export function useReviewActionRunner({
  organizerId,
  sectionKey,
  subjectType,
  subjectId,
  subjectLabel,
  currentStatus,
  markReviewed,
  markNeedsFollowUp,
  returnToClient,
}: UseReviewActionRunnerOptions): UseReviewActionRunnerResult {
  const [
    activeAction,
    setActiveAction,
  ] =
    useState<ReviewActionKey | null>(
      null,
    )

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

  const [
    timelineVersion,
    setTimelineVersion,
  ] = useState(0)

  const clearMessages =
    useCallback(() => {
      setErrorMessage(null)
      setSuccessMessage(null)
    }, [])

  const openAction =
    useCallback(
      (
        action:
          ReviewActionKey,
      ) => {
        clearMessages()
        setActiveAction(
          action,
        )
      },
      [
        clearMessages,
      ],
    )

  const closeAction =
    useCallback(() => {
      if (!isSaving) {
        setActiveAction(
          null,
        )
      }
    }, [
      isSaving,
    ])

  const runAction =
    useCallback(
      async (
        action:
          ReviewActionKey,
        explanation: string,
      ): Promise<boolean> => {
        try {
          setIsSaving(true)
          clearMessages()

          let didUpdate =
            false

          switch (action) {
            case "mark_reviewed":
              didUpdate =
                await markReviewed()
              break

            case "needs_follow_up":
              didUpdate =
                await markNeedsFollowUp(
                  explanation,
                )
              break

            case "return_to_client":
              didUpdate =
                await returnToClient(
                  explanation,
                )
              break
          }

          if (!didUpdate) {
            return false
          }

          await addReviewWorkflowEvent({
            organizerId,
            sectionKey,
            subjectType,
            subjectId,
            eventType:
              getEventType(
                action,
              ),
            explanation,
            metadata: {
              previousStatus:
                currentStatus,
              subjectLabel,
            },
          })

          setTimelineVersion(
            (current) =>
              current + 1,
          )

          setSuccessMessage(
            getSuccessMessage(
              action,
            ),
          )

          setActiveAction(
            null,
          )

          return true
        } catch (error) {
          console.error(
            "Unable to complete the review action:",
            error,
          )

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to complete the review action.",
          )

          return false
        } finally {
          setIsSaving(false)
        }
      },
      [
        clearMessages,
        currentStatus,
        markNeedsFollowUp,
        markReviewed,
        organizerId,
        returnToClient,
        sectionKey,
        subjectId,
        subjectLabel,
        subjectType,
      ],
    )

  return {
    activeAction,
    isSaving,
    errorMessage,
    successMessage,
    timelineVersion,
    openAction,
    closeAction,
    runAction,
    clearMessages,
  }
}
