import type {
  ReactNode,
} from "react"

interface OrganizerDecisionCardGroupProps {
  label: string

  description?: string

  errorMessage?: string

  children: ReactNode

  columns?: 1 | 2 | 3
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}

export function OrganizerDecisionCardGroup({
  label,
  description,
  errorMessage,
  children,
  columns = 2,
}: OrganizerDecisionCardGroupProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-800">
        {label}
      </legend>

      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      )}

      <div
        className={[
          "mt-4 grid gap-4",
          columnClasses[columns],
        ].join(" ")}
      >
        {children}
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="mt-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </p>
      )}
    </fieldset>
  )
}