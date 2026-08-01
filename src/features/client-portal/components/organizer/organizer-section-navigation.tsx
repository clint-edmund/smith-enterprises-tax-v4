import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react"

interface OrganizerSectionNavigationProps {
  previousLabel?: string
  nextLabel?: string

  onPrevious?: () => void
  onNext?: () => void

  previousDisabled?: boolean
  nextDisabled?: boolean
}

export function OrganizerSectionNavigation({
  previousLabel = "Previous",
  nextLabel = "Next Section",
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
}: OrganizerSectionNavigationProps) {
  return (
    <nav
      aria-label="Organizer section navigation"
      className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      {onPrevious ? (
        <button
          type="button"
          onClick={onPrevious}
          disabled={previousDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          {previousLabel}
        </button>
      ) : (
        <div />
      )}

      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {nextLabel}

          <ArrowRight
            className="size-4"
            aria-hidden="true"
          />
        </button>
      )}
    </nav>
  )
}