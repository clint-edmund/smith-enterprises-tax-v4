export type ReviewActionName =
  | "mark_reviewed"
  | "needs_follow_up"
  | "save_notes"
  | "return_to_client"

interface ReviewActionButtonsProps {
  disabled?: boolean
  isRunning: (
    action:
      ReviewActionName,
  ) => boolean
  onMarkReviewed: () => void
  onNeedsFollowUp: () => void
  onSaveNotes: () => void
  onReturnToClient: () => void
}

export function ReviewActionButtons({
  disabled = false,
  isRunning,
  onMarkReviewed,
  onNeedsFollowUp,
  onSaveNotes,
  onReturnToClient,
}: ReviewActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        disabled={
          disabled
        }
        onClick={
          onMarkReviewed
        }
        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRunning(
          "mark_reviewed",
        )
          ? "Saving..."
          : "Mark Reviewed"}
      </button>

      <button
        type="button"
        disabled={
          disabled
        }
        onClick={
          onNeedsFollowUp
        }
        className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRunning(
          "needs_follow_up",
        )
          ? "Saving..."
          : "Needs Follow-up"}
      </button>

      <button
        type="button"
        disabled={
          disabled
        }
        onClick={
          onSaveNotes
        }
        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRunning(
          "save_notes",
        )
          ? "Saving..."
          : "Save Notes"}
      </button>

      <button
        type="button"
        disabled={
          disabled
        }
        onClick={
          onReturnToClient
        }
        className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Return to Client
      </button>
    </div>
  )
}
