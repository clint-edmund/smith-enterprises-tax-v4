import type {
  ChangeEvent,
} from "react"

interface OrganizerPhoneFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void

  required?: boolean
  disabled?: boolean
  errorMessage?: string | null
  helpText?: string
}

function formatPhoneNumber(
  value: string,
): string {
  const digits =
    value.replace(/\D/g, "").slice(0, 10)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function OrganizerPhoneField({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  errorMessage,
  helpText,
}: OrganizerPhoneFieldProps) {
  const messageId =
    `${id}-message`

  function handleChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    onChange(
      formatPhoneNumber(
        event.target.value,
      ),
    )
  }

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
        type="tel"
        value={value}
        onChange={handleChange}
        inputMode="tel"
        autoComplete="tel"
        required={required}
        disabled={disabled}
        maxLength={14}
        placeholder="(555) 555-1234"
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
          "placeholder:text-slate-400",
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