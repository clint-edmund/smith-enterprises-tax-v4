import {
  Plus,
} from "lucide-react"

interface HealthcareHeaderProps {
  onAddCoverage: () => void
}

export function HealthcareHeader({
  onAddCoverage,
}: HealthcareHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Healthcare
        </h1>

        <p className="mt-2 text-slate-600">
          Review your health insurance
          information for the current
          tax year.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddCoverage}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        <Plus className="h-5 w-5" />

        Add Coverage
      </button>
    </div>
  )
}