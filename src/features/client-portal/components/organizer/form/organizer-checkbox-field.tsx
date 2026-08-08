import type {
  InputHTMLAttributes,
} from "react"

interface OrganizerCheckboxFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label: string

  description?: string

  error?: string
}

export function OrganizerCheckboxField({
  label,
  description,
  error,
  id,
  className = "",
  ...props
}: OrganizerCheckboxFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3"
      >
        <input
          id={id}
          type="checkbox"
          className={[
            "mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600",
            className,
          ].join(" ")}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${id}-error`
              : undefined
          }
          {...props}
        />

        <div>
          <div className="text-sm font-medium text-slate-700">
            {label}
          </div>

          {description && (
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>
      </label>

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