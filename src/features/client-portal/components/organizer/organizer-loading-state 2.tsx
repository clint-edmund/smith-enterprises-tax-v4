import {
  RefreshCw,
} from "lucide-react"

interface OrganizerLoadingStateProps {
  message?: string
}

export function OrganizerLoadingState({
  message = "Loading organizer...",
}: OrganizerLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <RefreshCw
        className="h-8 w-8 animate-spin text-blue-600"
        aria-hidden="true"
      />

      <p className="mt-5 text-sm font-semibold text-slate-700">
        {message}
      </p>
    </div>
  )
}