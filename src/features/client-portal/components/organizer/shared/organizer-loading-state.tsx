import {
  Loader2,
} from "lucide-react"

interface OrganizerLoadingStateProps {
  message?: string
}

export function OrganizerLoadingState({
  message = "Loading...",
}: OrganizerLoadingStateProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Loader2
          className="h-8 w-8 animate-spin text-blue-700"
          aria-hidden="true"
        />

        <p className="text-sm font-medium text-slate-600">
          {message}
        </p>
      </div>
    </div>
  )
}