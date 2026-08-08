import {
  Plus,
} from "lucide-react"

interface OrganizerCrudHeaderProps {
  title: string

  description: string

  addLabel?: string

  onAdd: () => void
}

export function OrganizerCrudHeader({
  title,
  description,
  addLabel = "Add",
  onAdd,
}: OrganizerCrudHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        <Plus
          className="h-4 w-4"
          aria-hidden="true"
        />

        {addLabel}
      </button>
    </div>
  )
}