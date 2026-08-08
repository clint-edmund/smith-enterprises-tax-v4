import {
  Loader2,
  Save,
} from "lucide-react"

interface OrganizerSaveBarProps {
  isSaving: boolean
  saveMessage?: string | null
  onSave: () => void
  onContinue?: () => void
}

export function OrganizerSaveBar({
  isSaving,
  saveMessage,
  onSave,
  onContinue,
}: OrganizerSaveBarProps) {
  return (
    <div className="sticky bottom-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:flex-row md:items-center md:justify-between">
      <div>
        {saveMessage ? (
          <p className="text-sm font-medium text-emerald-700">
            {saveMessage}
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Changes are saved securely to your organizer.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          Save Draft
        </button>

        {onContinue && (
          <button
            type="button"
            disabled={isSaving}
            onClick={onContinue}
            className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            Save & Continue
          </button>
        )}
      </div>
    </div>
  )
}