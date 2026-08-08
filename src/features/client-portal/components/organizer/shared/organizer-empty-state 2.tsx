import {
  Plus,
} from "lucide-react"

interface OrganizerEmptyStateProps {
  title: string

  description: string

  actionLabel?: string

  onAction: () => void
}

export function OrganizerEmptyState({
  title,
  description,
  actionLabel = "Add Item",
  onAction,
}: OrganizerEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
        <Plus
          className="h-7 w-7 text-blue-700"
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        {description}
      </p>

      <button
        type="button"
        onClick={onAction}
        className="mt-8 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        {actionLabel}
      </button>
    </div>
  )
}