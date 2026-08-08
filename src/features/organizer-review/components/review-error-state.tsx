import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

interface ReviewErrorStateProps {
  title?: string

  message: string

  returnLabel?: string

  returnHref?: string

  onRetry?: () => void
}

export function ReviewErrorState({
  title =
    "Unable to load review",
  message,
  returnLabel,
  returnHref,
  onRetry,
}: ReviewErrorStateProps) {
  return (
    <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <AlertTriangle
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-slate-950">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={
              onRetry
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Try Again
          </button>
        )}

        {returnHref &&
          returnLabel && (
          <Link
            to={
              returnHref
            }
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {
              returnLabel
            }
          </Link>
        )}
      </div>
    </section>
  )
}
