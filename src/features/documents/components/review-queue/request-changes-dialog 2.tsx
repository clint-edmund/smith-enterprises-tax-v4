import {
  AlertCircle,
  Loader2,
  MessageSquareWarning,
  X,
} from "lucide-react"
import {
  useEffect,
  useState,
} from "react"

interface RequestChangesDialogProps {
  isOpen: boolean
  documentName: string | null
  isSubmitting: boolean
  errorMessage: string | null
  onClose: () => void
  onSubmit: (
    comments: string,
  ) => Promise<void>
}

const maximumCommentLength = 2000

export function RequestChangesDialog({
  isOpen,
  documentName,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: RequestChangesDialogProps) {
  const [
    comments,
    setComments,
  ] = useState("")

  const [
    validationMessage,
    setValidationMessage,
  ] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setComments("")
      setValidationMessage(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isSubmitting
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
    isSubmitting,
    onClose,
  ])

  if (!isOpen) {
    return null
  }

  const trimmedComments =
    comments.trim()

  const canSubmit =
    trimmedComments.length > 0 &&
    comments.length <=
      maximumCommentLength &&
    !isSubmitting

  async function handleSubmit() {
    if (!trimmedComments) {
      setValidationMessage(
        "Review comments are required.",
      )

      return
    }

    if (
      comments.length >
      maximumCommentLength
    ) {
      setValidationMessage(
        `Comments cannot exceed ${maximumCommentLength.toLocaleString()} characters.`,
      )

      return
    }

    setValidationMessage(null)

    await onSubmit(trimmedComments)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSubmitting
        ) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-changes-title"
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-orange-100 p-2.5">
              <MessageSquareWarning
                className="h-5 w-5 text-orange-700"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2
                id="request-changes-title"
                className="text-lg font-semibold text-slate-950"
              >
                Request document changes
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Explain what must be corrected
                before this document can be
                approved.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close dialog"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="space-y-5 px-6 py-5">
          {documentName ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Document
              </p>

              <p className="mt-1 truncate text-sm font-medium text-slate-900">
                {documentName}
              </p>
            </div>
          ) : null}

          <div>
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="review-change-comments"
                className="text-sm font-semibold text-slate-900"
              >
                Review comments
              </label>

              <span
                className={
                  comments.length >
                  maximumCommentLength
                    ? "text-xs font-medium text-red-600"
                    : "text-xs text-slate-500"
                }
              >
                {comments.length.toLocaleString()}
                {" / "}
                {maximumCommentLength.toLocaleString()}
              </span>
            </div>

            <textarea
              id="review-change-comments"
              value={comments}
              rows={7}
              disabled={isSubmitting}
              autoFocus
              placeholder="Describe the missing information, incorrect values, or other changes required..."
              onChange={(event) => {
                setComments(
                  event.target.value,
                )

                if (validationMessage) {
                  setValidationMessage(null)
                }
              }}
              className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            {validationMessage ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-red-700">
                <AlertCircle
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />

                {validationMessage}
              </p>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                aria-hidden="true"
              />

              <p className="text-sm text-red-700">
                {errorMessage}
              </p>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              void handleSubmit()
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />

                Submitting...
              </>
            ) : (
              "Submit change request"
            )}
          </button>
        </footer>
      </section>
    </div>
  )
}