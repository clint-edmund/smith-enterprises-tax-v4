import type {
  ReactNode,
} from "react"

type ValidationSummaryVariant =
  | "success"
  | "warning"
  | "error"
  | "info"

interface OrganizerValidationSummaryProps {
  variant: ValidationSummaryVariant

  title?: string

  message: ReactNode
}

const variantClasses = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800",

  warning:
    "border-amber-200 bg-amber-50 text-amber-900",

  error:
    "border-red-200 bg-red-50 text-red-800",

  info:
    "border-blue-200 bg-blue-50 text-blue-800",
}

export function OrganizerValidationSummary({
  variant,
  title,
  message,
}: OrganizerValidationSummaryProps) {
  return (
    <div
      role="status"
      className={[
        "rounded-xl border p-4",
        variantClasses[
          variant
        ],
      ].join(" ")}
    >
      {title && (
        <h3 className="font-semibold">
          {title}
        </h3>
      )}

      <div
        className={
          title
            ? "mt-2 text-sm"
            : "text-sm"
        }
      >
        {message}
      </div>
    </div>
  )
}