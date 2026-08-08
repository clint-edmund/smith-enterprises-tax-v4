import type {
  ChangeEventHandler,
} from "react"

export interface OrganizerSelectOption {
  value: string
  label: string
}

interface OrganizerSelectFieldProps {
  id: string
  label: string
  value: string
  options: OrganizerSelectOption[]
  onChange: ChangeEventHandler<HTMLSelectElement>

  placeholder?: string
  required?: boolean
  disabled?: boolean
  errorMessage?: string | null
  helpText?: string
}

export function OrganizerSelectField({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  errorMessage,
  helpText,
}: OrganizerSelectFieldProps) {
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

      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
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
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

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