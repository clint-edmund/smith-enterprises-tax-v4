import type {
  InputHTMLAttributes,
} from "react"

interface OrganizerTextFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label: string

  error?: string

  required?: boolean
}

export function OrganizerTextField({
  label,
  error,
  required,
  id,
  className = "",
  ...props
}: OrganizerTextFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        type="text"
        className={[
          "block w-full rounded-xl border bg-white px-4 py-3 text-sm shadow-sm",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-blue-600 focus:ring-blue-600",
          className,
        ].join(" ")}
        aria-invalid={
          Boolean(error)
        }
        aria-describedby={
          error
            ? `${id}-error`
            : undefined
        }
        {...props}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  )
}