import type {
  ChangeEventHandler,
} from "react"

interface OrganizerDateFieldProps {
  id: string
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>

  required?: boolean
  disabled?: boolean
  errorMessage?: string | null
  helpText?: string
  min?: string
  max?: string
}

export function OrganizerDateField({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  errorMessage,
  helpText,
  min,
  max,
}: OrganizerDateFieldProps) {
  const messageId =
    `${id}-message`

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800"
      >
        {label}

        {required && (
          <span
            className="ml-1 text-red-600"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      <input
        id={id}
        type="date"
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        aria-invalid={
          Boolean(errorMessage)
        }
        aria-describedby={
          errorMessage || helpText
            ? messageId
            : undefined
        }
        className={[
          "mt-2 w-full rounded-xl border bg-white px-4 py-3",
          "text-slate-950 outline-none transition",
          "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
          errorMessage
            ? "border-red-400 focus:border-red-600 focus:ring-4 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100",
        ].join(" ")}
      />

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
    </div>
  )
}