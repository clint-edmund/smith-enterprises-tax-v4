interface OrganizerFormActionsProps {
  isSaving?: boolean

  saveLabel?: string

  cancelLabel?: string

  onCancel: () => void
}

export function OrganizerFormActions({
  isSaving = false,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  onCancel,
}: OrganizerFormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cancelLabel}
      </button>

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving
          ? "Saving..."
          : saveLabel}
      </button>
    </div>
  )
}