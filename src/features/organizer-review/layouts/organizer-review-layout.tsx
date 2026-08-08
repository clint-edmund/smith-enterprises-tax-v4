import type {
  ReactNode,
} from "react"

import {
  OrganizerReviewProgressSidebar,
} from "@/features/organizer-review/components"

import type {
  OrganizerReviewWorkflowSectionKey,
} from "@/features/organizer-review/constants"

interface OrganizerReviewLayoutProps {
  breadcrumbs?: ReactNode

  header: ReactNode

  actions?: ReactNode

  children: ReactNode

  sidebar?: ReactNode

  clientId?: string

  taxYear?: number

  currentSection?:
    OrganizerReviewWorkflowSectionKey
}

export function OrganizerReviewLayout({
  breadcrumbs,
  header,
  actions,
  children,
  sidebar,
  clientId,
  taxYear,
  currentSection,
}: OrganizerReviewLayoutProps) {
  const shouldShowProgressSidebar =
    Boolean(
      clientId &&
      taxYear &&
      currentSection,
    )

  const resolvedSidebar =
    sidebar ??
    (
      shouldShowProgressSidebar &&
      clientId &&
      taxYear &&
      currentSection ? (
        <OrganizerReviewProgressSidebar
          clientId={
            clientId
          }
          taxYear={
            taxYear
          }
          currentSection={
            currentSection
          }
        />
      ) : null
    )

  return (
    <section className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">
      {breadcrumbs}

      <div className="space-y-4">
        {header}

        {actions}
      </div>

      {resolvedSidebar ? (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(260px,0.72fr)_minmax(0,2fr)]">
          <aside className="space-y-6 xl:sticky xl:top-6">
            {
              resolvedSidebar
            }
          </aside>

          <main className="min-w-0 space-y-6">
            {children}
          </main>
        </div>
      ) : (
        <main className="space-y-6">
          {children}
        </main>
      )}
    </section>
  )
}
