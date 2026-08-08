import type {
  ReactNode,
} from "react"

interface OrganizerSectionLayoutProps {
  title: string

  description: string

  action?: ReactNode

  health?: ReactNode

  toolbar?: ReactNode

  summary?: ReactNode

  children: ReactNode
}

export function OrganizerSectionLayout({
  title,
  description,
  action,
  health,
  toolbar,
  summary,
  children,
}: OrganizerSectionLayoutProps) {
  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>

          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      </header>

      {health}

      {toolbar}

      <div>
        {children}
      </div>

      {summary}
    </section>
  )
}