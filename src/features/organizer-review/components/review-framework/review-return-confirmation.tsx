interface ReviewReturnConfirmationProps {
  isRunning?: boolean
  message?: string
  onCancel: () => void
  onConfirm: () => void
}

export function ReviewReturnConfirmation({
  isRunning = false,
  message =
    "The organizer will be marked returned and directed back to the applicable section.",
  onCancel,
  onConfirm,
}: ReviewReturnConfirmationProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="font-semibold text-red-900">
        Return this record to the client?
      </p>

      <p className="mt-1 text-sm leading-6 text-red-800">
        {message}
      </p>

      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          disabled={
            isRunning
          }
          onClick={
            onCancel
          }
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={
            isRunning
          }
          onClick={
            onConfirm
          }
          className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning
            ? "Returning..."
            : "Confirm Return"}
        </button>
      </div>
    </div>
  )
}
