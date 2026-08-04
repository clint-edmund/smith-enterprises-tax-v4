interface ReviewNotesEditorProps {
  id: string
  value: string
  disabled?: boolean
  maxLength?: number
  label?: string
  placeholder?: string
  onChange: (
    value: string,
  ) => void
}

export function ReviewNotesEditor({
  id,
  value,
  disabled = false,
  maxLength = 10000,
  label =
    "Internal Staff Notes",
  placeholder =
    "Add staff-only notes. These notes are not visible to the client.",
  onChange,
}: ReviewNotesEditorProps) {
  return (
    <div>
      <label
        htmlFor={
          id
        }
        className="block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>

      <textarea
        id={
          id
        }
        rows={4}
        maxLength={
          maxLength
        }
        value={
          value
        }
        disabled={
          disabled
        }
        placeholder={
          placeholder
        }
        onChange={(event) => {
          onChange(
            event.target.value,
          )
        }}
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />

      <p className="mt-2 text-xs text-slate-500">
        {
          value.length
        }
        /
        {
          maxLength
        }
        {" "}
        characters
      </p>
    </div>
  )
}
