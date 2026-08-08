import type {
  ReactNode,
} from "react"

interface ReviewRecordCardProps {
  title: string

  subtitle?: string

  status?: ReactNode

  children: ReactNode

  footer?: ReactNode
}

export function ReviewRecordCard({
  title,
  subtitle,
  status,
  children,
  footer,
}: ReviewRecordCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <header className="border-b border-slate-200 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-950">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-600">
                {subtitle}
              </p>
            )}
          </div>

          {status}
        </div>
      </header>

      <div className="p-6">
        {children}
      </div>

      {footer && (
        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          {footer}
        </footer>
      )}
    </article>
  )
}