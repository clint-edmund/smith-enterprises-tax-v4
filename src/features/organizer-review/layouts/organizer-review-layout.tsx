import type {
  ReactNode,
} from "react"

interface OrganizerReviewLayoutProps {
  breadcrumbs?: ReactNode

  header: ReactNode

  actions?: ReactNode

  children: ReactNode

  sidebar?: ReactNode
}

export function OrganizerReviewLayout({
  breadcrumbs,
  header,
  actions,
  children,
  sidebar,
}: OrganizerReviewLayoutProps) {
  return (
    <section className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">
      {breadcrumbs}

      <div className="space-y-4">
        {header}

        {actions}
      </div>

      {sidebar ? (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
          <main className="min-w-0 space-y-6">
            {children}
          </main>

          <aside className="space-y-6 xl:sticky xl:top-6">
            {sidebar}
          </aside>
        </div>
      ) : (
        <main className="space-y-6">
          {children}
        </main>
      )}
    </section>
  )
}
