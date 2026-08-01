interface OrganizerYesNoQuestionProps {
  id: string
  label: string
  value: boolean | null
  onChange: (
    value: boolean,
  ) => void

  required?: boolean
  disabled?: boolean
  errorMessage?: string | null
  helpText?: string
}

export function OrganizerYesNoQuestion({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  errorMessage,
  helpText,
}: OrganizerYesNoQuestionProps) {
  const messageId =
    `${id}-message`

  return (
    <fieldset
      aria-describedby={
        errorMessage || helpText
          ? messageId
          : undefined
      }
    >
      <legend className="text-sm font-semibold text-slate-800">
        {label}

        {required && (
          <span
            className="ml-1 text-red-600"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </legend>

      <div className="mt-3 flex flex-wrap gap-3">
        <label
          className={[
            "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition",
            value === true
              ? "border-blue-600 bg-blue-50 text-blue-900"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "",
          ].join(" ")}
        >
          <input
            type="radio"
            name={id}
            value="yes"
            checked={value === true}
            onChange={() => {
              onChange(true)
            }}
            required={required}
            disabled={disabled}
            className="size-4 border-slate-300 text-blue-700 focus:ring-blue-600"
          />

          <span className="text-sm font-semibold">
            Yes
          </span>
        </label>

        <label
          className={[
            "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition",
            value === false
              ? "border-blue-600 bg-blue-50 text-blue-900"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "",
          ].join(" ")}
        >
          <input
            type="radio"
            name={id}
            value="no"
            checked={value === false}
            onChange={() => {
              onChange(false)
            }}
            required={required}
            disabled={disabled}
            className="size-4 border-slate-300 text-blue-700 focus:ring-blue-600"
          />

          <span className="text-sm font-semibold">
            No
          </span>
        </label>
      </div>

      {(errorMessage || helpText) && (
        <p
          id={messageId}
          className={[
            "mt-2 text-sm",
            errorMessage
              ? "font-medium text-red-700"
              : "text-slate-500",
          ].join(" ")}
        >
          {errorMessage ?? helpText}
        </p>
      )}
    </fieldset>
  )
}