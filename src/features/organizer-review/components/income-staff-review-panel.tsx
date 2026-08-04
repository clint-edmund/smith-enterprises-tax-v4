import {
  useEffect,
  useState,
} from "react"

import {
  ReviewActionButtons,
  ReviewNotesEditor,
  ReviewPanel,
  ReviewReturnConfirmation,
} from "@/features/organizer-review/components/review-framework"

import type {
  StaffIncomeReviewSource,
} from "@/features/organizer-review/types"

type IncomeReviewAction =
  | "mark_reviewed"
  | "needs_follow_up"
  | "save_notes"
  | "return_to_client"

interface IncomeStaffReviewPanelProps {
  source:
    StaffIncomeReviewSource

  isActionRunning: (
    incomeSourceId: string,
    action?:
      IncomeReviewAction,
  ) => boolean

  onMarkReviewed: (
    incomeSourceId: string,
  ) => Promise<void>

  onNeedsFollowUp: (
    incomeSourceId: string,
    internalNotes: string,
  ) => Promise<void>

  onSaveNotes: (
    incomeSourceId: string,
    internalNotes: string,
  ) => Promise<void>

  onReturnToClient: (
    incomeSourceId: string,
    internalNotes: string,
  ) => Promise<void>
}

function formatTimestamp(
  value:
    string | null,
): string {
  if (!value) {
    return "Not yet updated"
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    },
  ).format(
    date,
  )
}

export function IncomeStaffReviewPanel({
  source,
  isActionRunning,
  onMarkReviewed,
  onNeedsFollowUp,
  onSaveNotes,
  onReturnToClient,
}: IncomeStaffReviewPanelProps) {
  const [
    internalNotes,
    setInternalNotes,
  ] =
    useState(
      source.internalNotes,
    )

  const [
    localError,
    setLocalError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    showReturnConfirmation,
    setShowReturnConfirmation,
  ] =
    useState(false)

  useEffect(() => {
    setInternalNotes(
      source.internalNotes,
    )
    setLocalError(null)
  }, [
    source.internalNotes,
  ])

  const recordIsSaving =
    isActionRunning(
      source.incomeSourceId,
    )

  async function runAction(
    callback:
      () => Promise<void>,
  ) {
    setLocalError(null)

    try {
      await callback()
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "The Income review action could not be completed.",
      )
    }
  }

  return (
    <ReviewPanel
      status={
        source.reviewStatus
      }
      reviewedByName={
        source.reviewedByName
      }
      updatedLabel={
        formatTimestamp(
          source.reviewUpdatedAt,
        )
      }
    >
      <ReviewNotesEditor
        id={`income-review-notes-${source.incomeSourceId}`}
        value={
          internalNotes
        }
        disabled={
          recordIsSaving
        }
        onChange={(value) => {
          setInternalNotes(
            value,
          )
          setLocalError(null)
        }}
      />

      {source.reviewedAt && (
        <p className="text-xs text-slate-500">
          Reviewed{" "}
          {
            formatTimestamp(
              source.reviewedAt,
            )
          }
        </p>
      )}

      {localError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {
            localError
          }
        </p>
      )}

      <ReviewActionButtons
        disabled={
          recordIsSaving
        }
        isRunning={(action) =>
          isActionRunning(
            source.incomeSourceId,
            action,
          )
        }
        onMarkReviewed={() => {
          void runAction(
            async () => {
              await onMarkReviewed(
                source.incomeSourceId,
              )
            },
          )
        }}
        onNeedsFollowUp={() => {
          if (
            !internalNotes.trim()
          ) {
            setLocalError(
              "Add an internal note before requesting follow-up.",
            )
            return
          }

          void runAction(
            async () => {
              await onNeedsFollowUp(
                source.incomeSourceId,
                internalNotes,
              )
            },
          )
        }}
        onSaveNotes={() => {
          void runAction(
            async () => {
              await onSaveNotes(
                source.incomeSourceId,
                internalNotes,
              )
            },
          )
        }}
        onReturnToClient={() => {
          if (
            !internalNotes.trim()
          ) {
            setLocalError(
              "Add a note explaining what the client must correct.",
            )
            return
          }

          setLocalError(null)
          setShowReturnConfirmation(
            true,
          )
        }}
      />

      {showReturnConfirmation && (
        <ReviewReturnConfirmation
          isRunning={
            isActionRunning(
              source.incomeSourceId,
              "return_to_client",
            )
          }
          message="The organizer will be marked returned and directed back to the Income section."
          onCancel={() => {
            setShowReturnConfirmation(
              false,
            )
          }}
          onConfirm={() => {
            void runAction(
              async () => {
                await onReturnToClient(
                  source.incomeSourceId,
                  internalNotes,
                )

                setShowReturnConfirmation(
                  false,
                )
              },
            )
          }}
        />
      )}
    </ReviewPanel>
  )
}
