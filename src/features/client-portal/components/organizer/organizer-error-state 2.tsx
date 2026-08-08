import {
  AlertCircle,
} from "lucide-react"

interface OrganizerErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function OrganizerErrorState({
  title = "Unable to load organizer",
  message,
  onRetry,
}: OrganizerErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
      <div className="flex gap-4">
        <AlertCircle
          className="mt-1 h-6 w-6 shrink-0 text-red-600"
          aria-hidden="true"
        />

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-red-900">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-700">
            {message}
          </p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}