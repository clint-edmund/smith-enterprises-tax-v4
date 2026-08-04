import {
  useEffect,
  useState,
} from "react"

import {
  ReviewStatusBadge,
} from "@/features/organizer-review/components/review-status-badge"

import type {
  StaffIncomeReviewSource,
  StaffIncomeReviewStatus,
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

const reviewStatusLabels:
  Record<
    StaffIncomeReviewStatus,
    string
  > = {
    pending:
      "Pending Review",

    reviewed:
      "Reviewed",

    needs_follow_up:
      "Needs Follow-up",

    returned_to_client:
      "Returned to Client",
  }

function getBadgeStatus(
  status:
    StaffIncomeReviewStatus,
) {
  if (status === "reviewed") {
    return "complete" as const
  }

  if (
    status === "needs_follow_up" ||
    status === "returned_to_client"
  ) {
    return "needs_attention" as const
  }

  return "in_progress" as const
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
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Staff Review
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ReviewStatusBadge
              status={
                getBadgeStatus(
                  source.reviewStatus,
                )
              }
              label={
                reviewStatusLabels[
                  source.reviewStatus
                ]
              }
            />

            {source.reviewedByName && (
              <span className="text-xs text-slate-500">
                by{" "}
                {
                  source.reviewedByName
                }
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Updated{" "}
          {
            formatTimestamp(
              source.reviewUpdatedAt,
            )
          }
        </p>
      </div>

      <label
        htmlFor={`income-review-notes-${source.incomeSourceId}`}
        className="mt-4 block text-sm font-semibold text-slate-800"
      >
        Internal Staff Notes
      </label>

      <textarea
        id={`income-review-notes-${source.incomeSourceId}`}
        rows={4}
        maxLength={10000}
        value={
          internalNotes
        }
        disabled={
          recordIsSaving
        }
        placeholder="Add staff-only notes. These notes are not visible to the client."
        onChange={(event) => {
          setInternalNotes(
            event.target.value,
          )
          setLocalError(null)
        }}
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />

      <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {
            internalNotes.length
          }
          /10,000 characters
        </span>

        {source.reviewedAt && (
          <span>
            Reviewed{" "}
            {
              formatTimestamp(
                source.reviewedAt,
              )
            }
          </span>
        )}
      </div>

      {localError && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {
            localError
          }
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={
            recordIsSaving
          }
          onClick={() => {
            void runAction(
              async () => {
                await onMarkReviewed(
                  source.incomeSourceId,
                )
              },
            )
          }}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isActionRunning(
            source.incomeSourceId,
            "mark_reviewed",
          )
            ? "Saving..."
            : "Mark Reviewed"}
        </button>

        <button
          type="button"
          disabled={
            recordIsSaving
          }
          onClick={() => {
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
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isActionRunning(
            source.incomeSourceId,
            "needs_follow_up",
          )
            ? "Saving..."
            : "Needs Follow-up"}
        </button>

        <button
          type="button"
          disabled={
            recordIsSaving
          }
          onClick={() => {
            void runAction(
              async () => {
                await onSaveNotes(
                  source.incomeSourceId,
                  internalNotes,
                )
              },
            )
          }}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isActionRunning(
            source.incomeSourceId,
            "save_notes",
          )
            ? "Saving..."
            : "Save Notes"}
        </button>

        <button
          type="button"
          disabled={
            recordIsSaving
          }
          onClick={() => {
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
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Return to Client
        </button>
      </div>

      {showReturnConfirmation && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-900">
            Return this Income record to the client?
          </p>

          <p className="mt-1 text-sm leading-6 text-red-800">
            The organizer will be marked returned and directed back to the Income section.
          </p>

          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={
                recordIsSaving
              }
              onClick={() => {
                setShowReturnConfirmation(
                  false,
                )
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                recordIsSaving
              }
              onClick={() => {
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
              className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isActionRunning(
                source.incomeSourceId,
                "return_to_client",
              )
                ? "Returning..."
                : "Confirm Return"}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
