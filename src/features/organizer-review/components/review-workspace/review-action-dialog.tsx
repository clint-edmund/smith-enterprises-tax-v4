import {
  useEffect,
  useRef,
  useState,
} from "react"

import type {
  ReviewActionKey,
} from "@/features/organizer-review/types/review-action.types"

interface ReviewActionDialogProps {
  action:
    ReviewActionKey | null
  subjectLabel: string
  isSaving?: boolean
  onClose: () => void
  onConfirm: (
    action:
      ReviewActionKey,
    explanation: string,
  ) => Promise<boolean>
}

const content = {
  mark_reviewed: {
    title:
      "Mark Reviewed",
    description:
      "Confirm that this dependent review is complete.",
    label:
      "Review Summary",
    placeholder:
      "Summarize what was verified and why this dependent is ready.",
    confirm:
      "Confirm Review",
  },
  needs_follow_up: {
    title:
      "Needs Follow-up",
    description:
      "Record what staff must investigate before this review can continue.",
    label:
      "Follow-up Reason",
    placeholder:
      "Describe the missing information or issue requiring follow-up.",
    confirm:
      "Save Follow-up",
  },
  return_to_client: {
    title:
      "Return to Client",
    description:
      "Reopen the Dependents section so the client can make a correction.",
    label:
      "Client Correction Request",
    placeholder:
      "Clearly explain what the client needs to correct or provide.",
    confirm:
      "Return to Client",
  },
} as const

export function ReviewActionDialog({
  action,
  subjectLabel,
  isSaving = false,
  onClose,
  onConfirm,
}: ReviewActionDialogProps) {
  const [
    explanation,
    setExplanation,
  ] = useState("")

  const dialogRef =
    useRef<HTMLElement | null>(
      null,
    )

  const previouslyFocusedElement =
    useRef<HTMLElement | null>(
      null,
    )

  const [
    validationMessage,
    setValidationMessage,
  ] =
    useState<string | null>(
      null,
    )

  useEffect(() => {
    setExplanation("")
    setValidationMessage(null)
  }, [
    action,
  ])

  useEffect(() => {
    if (!action) {
      return
    }

    previouslyFocusedElement.current =
      document.activeElement instanceof
        HTMLElement
        ? document.activeElement
        : null

    return () => {
      previouslyFocusedElement.current?.focus()
    }
  }, [
    action,
  ])

  useEffect(() => {
    if (!action) {
      return
    }

    function handleKeyDown(
      event:
        KeyboardEvent,
    ) {
      if (
        event.key ===
          "Escape" &&
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
    action,
    isSaving,
    onClose,
  ])

  if (!action) {
    return null
  }

  const dialogContent =
    content[
      action
    ]

  async function handleSubmit() {
  const normalized =
    explanation.trim()

  if (!normalized) {
    setValidationMessage(
      "An explanation is required.",
    )

    return
  }

  if (!action) {
    return
  }

  setValidationMessage(null)

  await onConfirm(
    action,
    normalized,
  )
}

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSaving
        ) {
          onClose()
        }
      }}
    >
      <section
        ref={
          dialogRef
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-action-dialog-title"
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Review Action
        </p>

        <h2
          id="review-action-dialog-title"
          className="mt-2 text-2xl font-semibold text-slate-950"
        >
          {dialogContent.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {dialogContent.description}
        </p>

        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800">
          {subjectLabel}
        </p>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-800">
            {dialogContent.label}
          </span>

          <textarea
            autoFocus
            value={
              explanation
            }
            onChange={(event) => {
              setExplanation(
                event.target.value,
              )
              setValidationMessage(null)
            }}
            disabled={
              isSaving
            }
            maxLength={10000}
            rows={6}
            placeholder={
              dialogContent.placeholder
            }
            className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
          />
        </label>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {explanation.length.toLocaleString()} / 10,000 characters
          </p>

          {validationMessage && (
            <p
              className="text-sm font-medium text-red-700"
              role="alert"
            >
              {validationMessage}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSaving
            }
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              void handleSubmit()
            }}
            disabled={
              isSaving
            }
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving
              ? "Saving..."
              : dialogContent.confirm}
          </button>
        </div>
      </section>
    </div>
  )
}
