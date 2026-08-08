import {
  useCallback,
  useState,
} from "react"

import {
  markIncomeReviewComplete,
  markIncomeReviewNeedsFollowUp,
  returnIncomeRecordToClient,
  saveIncomeReviewNotes,
} from "@/features/organizer-review/services"

import type {
  StaffIncomeReviewActionResult,
} from "@/features/organizer-review/types"

interface UseIncomeReviewActionsOptions {
  onSuccess?: (
    result:
      StaffIncomeReviewActionResult,
  ) => void | Promise<void>
}

interface IncomeReviewActionState {
  incomeSourceId: string
  action:
    | "mark_reviewed"
    | "needs_follow_up"
    | "save_notes"
    | "return_to_client"
}

export function useIncomeReviewActions({
  onSuccess,
}: UseIncomeReviewActionsOptions = {}) {
  const [
    activeAction,
    setActiveAction,
  ] =
    useState<IncomeReviewActionState | null>(
      null,
    )

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    )

  const runAction =
    useCallback(
      async (
        actionState:
          IncomeReviewActionState,
        callback: () =>
          Promise<StaffIncomeReviewActionResult>,
      ) => {
        setActiveAction(
          actionState,
        )
        setErrorMessage(null)

        try {
          const result =
            await callback()

          await onSuccess?.(
            result,
          )

          return result
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "The Income review action could not be completed."

          setErrorMessage(
            message,
          )

          throw error
        } finally {
          setActiveAction(
            null,
          )
        }
      },
      [
        onSuccess,
      ],
    )

  const markReviewed =
    useCallback(
      async (
        incomeSourceId:
          string,
      ) =>
        runAction(
          {
            incomeSourceId,
            action:
              "mark_reviewed",
          },
          () =>
            markIncomeReviewComplete({
              incomeSourceId,
            }),
        ),
      [
        runAction,
      ],
    )

  const markNeedsFollowUp =
    useCallback(
      async (
        incomeSourceId:
          string,
        internalNotes:
          string,
      ) =>
        runAction(
          {
            incomeSourceId,
            action:
              "needs_follow_up",
          },
          () =>
            markIncomeReviewNeedsFollowUp({
              incomeSourceId,
              internalNotes,
            }),
        ),
      [
        runAction,
      ],
    )

  const saveNotes =
    useCallback(
      async (
        incomeSourceId:
          string,
        internalNotes:
          string,
      ) =>
        runAction(
          {
            incomeSourceId,
            action:
              "save_notes",
          },
          () =>
            saveIncomeReviewNotes({
              incomeSourceId,
              internalNotes,
            }),
        ),
      [
        runAction,
      ],
    )

  const returnToClient =
    useCallback(
      async (
        incomeSourceId:
          string,
        internalNotes:
          string,
      ) =>
        runAction(
          {
            incomeSourceId,
            action:
              "return_to_client",
          },
          () =>
            returnIncomeRecordToClient({
              incomeSourceId,
              internalNotes,
            }),
        ),
      [
        runAction,
      ],
    )

  const isActionRunning =
    useCallback(
      (
        incomeSourceId:
          string,
        action?:
          IncomeReviewActionState["action"],
      ) =>
        activeAction
          ?.incomeSourceId ===
          incomeSourceId &&
        (
          !action ||
          activeAction.action ===
            action
        ),
      [
        activeAction,
      ],
    )

  const clearError =
    useCallback(
      () => {
        setErrorMessage(null)
      },
      [],
    )

  return {
    activeAction,
    isSaving:
      activeAction !== null,
    errorMessage,
    markReviewed,
    markNeedsFollowUp,
    saveNotes,
    returnToClient,
    isActionRunning,
    clearError,
  }
}
