import {
  Inbox,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

interface ReviewEmptyStateProps {
  title: string

  description: string

  actionLabel?: string

  actionHref?: string

  onAction?: () => void
}

export function ReviewEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: ReviewEmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
        <Inbox
          className="h-7 w-7"
          aria-hidden="true"
        />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-slate-950">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {description}
      </p>

      {actionLabel &&
        actionHref && (
        <Link
          to={
            actionHref
          }
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          {
            actionLabel
          }
        </Link>
      )}

      {actionLabel &&
        !actionHref &&
        onAction && (
        <button
          type="button"
          onClick={
            onAction
          }
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          {
            actionLabel
          }
        </button>
      )}
    </section>
  )
}
