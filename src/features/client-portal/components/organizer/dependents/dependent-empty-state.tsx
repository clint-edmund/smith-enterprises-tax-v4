import {
  UserPlus,
} from "lucide-react"

interface DependentEmptyStateProps {
  onAdd: () => void
}

export function DependentEmptyState({
  onAdd,
}: DependentEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
        <UserPlus
          className="h-7 w-7 text-blue-700"
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        No Dependents Added
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        Add each person who may qualify as a dependent on your tax return.
        You can securely store their Social Security number after the
        dependent has been created.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-8 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Add Your First Dependent
      </button>
    </div>
  )
}