import {
  CalendarDays,
  LoaderCircle,
  UserRoundCheck,
  X,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  useDocumentReviewers,
} from "@/features/documents/hooks/use-document-reviewers"

import type {
  ClientDocument,
  DocumentReviewer,
} from "@/features/documents/types/document.types"

interface ReviewerAssignmentDialogProps {
  document: ClientDocument | null
  isOpen: boolean
  isSaving?: boolean
  errorMessage?: string | null
  onClose: () => void
  onAssign: (request: {
    reviewer: DocumentReviewer
    dueAt: string | null
  }) => void | Promise<void>
}

function formatReviewerName(
  reviewer: DocumentReviewer,
): string {
  return (
    reviewer.displayName?.trim() ||
    reviewer.email
  )
}

function createInitialDueDate(
  reviewDueAt: string | null | undefined,
): string {
  if (!reviewDueAt) {
    return ""
  }

  const date = new Date(reviewDueAt)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0")
  const day = String(
    date.getDate(),
  ).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function createDueAtValue(
  dueDate: string,
): string | null {
  if (!dueDate) {
    return null
  }

  const date = new Date(
    `${dueDate}T23:59:59`,
  )

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

export function ReviewerAssignmentDialog({
  document,
  isOpen,
  isSaving = false,
  errorMessage = null,
  onClose,
  onAssign,
}: ReviewerAssignmentDialogProps) {
  const {
    reviewers,
    isLoading,
    error,
    refresh,
  } = useDocumentReviewers()

  const [
    selectedReviewerId,
    setSelectedReviewerId,
  ] = useState("")

  const [
    dueDate,
    setDueDate,
  ] = useState("")

  const [
    validationMessage,
    setValidationMessage,
  ] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !document) {
      return
    }

    setSelectedReviewerId(
      document.assignedReviewerId ?? "",
    )

    setDueDate(
      createInitialDueDate(
        document.reviewDueAt,
      ),
    )

    setValidationMessage(null)
  }, [
    document,
    isOpen,
  ])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isSaving
      ) {
        onClose()
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      )
    }
  }, [
    isOpen,
    isSaving,
    onClose,
  ])

  const selectedReviewer = useMemo(
    () =>
      reviewers.find(
        (reviewer) =>
          reviewer.id ===
          selectedReviewerId,
      ) ?? null,
    [
      reviewers,
      selectedReviewerId,
    ],
  )

  const availableReviewers = useMemo(
    () =>
      [...reviewers].sort(
        (first, second) =>
          formatReviewerName(
            first,
          ).localeCompare(
            formatReviewerName(second),
          ),
      ),
    [reviewers],
  )

  if (!isOpen || !document) {
    return null
  }

  const displayedError =
    validationMessage ??
    errorMessage ??
    error

  async function handleSubmit() {
    setValidationMessage(null)

    if (!selectedReviewer) {
      setValidationMessage(
        "Select a reviewer before saving the assignment.",
      )
      return
    }

    await onAssign({
      reviewer: selectedReviewer,
      dueAt:
        createDueAtValue(dueDate),
    })
  }

  function handleBackdropClick(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    if (
      event.target ===
        event.currentTarget &&
      !isSaving
    ) {
      onClose()
    }
  }

  return (
    <div
      aria-labelledby="reviewer-assignment-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={
        handleBackdropClick
      }
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <UserRoundCheck className="size-5" />
            </div>

            <div>
              <h2
                className="text-lg font-bold text-slate-950"
                id="reviewer-assignment-title"
              >
                Assign Reviewer
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Assign a staff member
                to review{" "}
                <span className="font-semibold text-slate-800">
                  {
                    document.originalFileName
                  }
                </span>
                .
              </p>
            </div>
          </div>

          <button
            aria-label="Close reviewer assignment dialog"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">
              Reviewer
            </span>

            <span className="ml-1 text-sm text-red-600">
              *
            </span>

            <select
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
              disabled={
                isLoading ||
                isSaving
              }
              onChange={(event) => {
                setSelectedReviewerId(
                  event.target.value,
                )
                setValidationMessage(
                  null,
                )
              }}
              value={
                selectedReviewerId
              }
            >
              <option value="">
                {isLoading
                  ? "Loading reviewers..."
                  : "Select a reviewer"}
              </option>

              {availableReviewers.map(
                (reviewer) => (
                  <option
                    key={reviewer.id}
                    value={reviewer.id}
                  >
                    {formatReviewerName(
                      reviewer,
                    )}
                    {" — "}
                    {reviewer.role.replaceAll(
                      "_",
                      " ",
                    )}
                  </option>
                ),
              )}
            </select>
          </label>

          {!isLoading &&
          reviewers.length === 0 &&
          !error ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              No eligible reviewers
              are currently available.
            </div>
          ) : null}

          {error ? (
            <button
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline disabled:opacity-50"
              disabled={
                isLoading ||
                isSaving
              }
              onClick={() =>
                void refresh()
              }
              type="button"
            >
              Retry loading reviewers
            </button>
          ) : null}

          <label className="block">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CalendarDays className="size-4 text-slate-500" />
              Review due date
            </span>

            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
              disabled={isSaving}
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(event) =>
                setDueDate(
                  event.target.value,
                )
              }
              type="date"
              value={dueDate}
            />

            <p className="mt-1.5 text-xs text-slate-500">
              The due date is optional.
              Leave it blank when no
              deadline is required.
            </p>
          </label>

          {selectedReviewer ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                Assignment Summary
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {formatReviewerName(
                  selectedReviewer,
                )}
              </p>

              <p className="mt-1 text-xs capitalize text-slate-600">
                {selectedReviewer.role.replaceAll(
                  "_",
                  " ",
                )}
              </p>

              {dueDate ? (
                <p className="mt-2 text-xs text-slate-600">
                  Due{" "}
                  {new Date(
                    `${dueDate}T12:00:00`,
                  ).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-600">
                  No due date selected
                </p>
              )}
            </div>
          ) : null}

          {displayedError ? (
            <div
              aria-live="polite"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {displayedError}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-5">
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              isSaving ||
              isLoading ||
              !selectedReviewer
            }
            onClick={() =>
              void handleSubmit()
            }
            type="button"
          >
            {isSaving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <UserRoundCheck className="size-4" />
            )}

            {isSaving
              ? "Assigning..."
              : "Assign Reviewer"}
          </button>
        </div>
      </div>
    </div>
  )
}