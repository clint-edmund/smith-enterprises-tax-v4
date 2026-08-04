import type {
  ReactNode,
} from "react"

import {
  OrganizerReviewProgressHeader,
  OrganizerReviewProgressSidebarView,
  OrganizerReviewReadinessCard,
} from "@/features/organizer-review/components"

import type {
  OrganizerReviewWorkflowSectionKey,
} from "@/features/organizer-review/constants"

import {
  useOrganizerReviewProgress,
} from "@/features/organizer-review/hooks"

import {
  OrganizerReviewLayout,
} from "./organizer-review-layout"

interface OrganizerReviewShellProps {
  clientId: string

  taxYear: number

  currentSection:
    OrganizerReviewWorkflowSectionKey

  breadcrumbs?: ReactNode

  header: ReactNode

  actions?: ReactNode

  children: ReactNode

  preparationHref?: string

  showProgressHeader?: boolean

  showReadinessCard?: boolean
}

export function OrganizerReviewShell({
  clientId,
  taxYear,
  currentSection,
  breadcrumbs,
  header,
  actions,
  children,
  preparationHref,
  showProgressHeader = true,
  showReadinessCard = true,
}: OrganizerReviewShellProps) {
  const {
    progress,
    isLoading,
    errorMessage,
    refresh,
  } =
    useOrganizerReviewProgress(
      clientId,
      taxYear,
    )

  let sidebar:
    ReactNode

  if (isLoading) {
    sidebar = (
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-5 w-40 rounded bg-slate-200" />

        <div className="mt-4 h-3 w-full rounded bg-slate-100" />

        <div className="mt-6 space-y-3">
          {Array.from({
            length: 5,
          }).map(
            (
              _,
              index,
            ) => (
              <div
                key={
                  index
                }
                className="h-14 rounded-xl bg-slate-100"
              />
            ),
          )}
        </div>
      </div>
    )
  } else if (
    errorMessage ||
    !progress
  ) {
    sidebar = (
      <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
        <p className="font-semibold text-slate-950">
          Unable to load progress
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {errorMessage ??
            "The organizer workflow could not be loaded."}
        </p>

        <button
          type="button"
          onClick={() => {
            void refresh()
          }}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Try Again
        </button>
      </div>
    )
  } else {
    sidebar = (
      <div className="space-y-6">
        <OrganizerReviewProgressSidebarView
          progress={
            progress
          }
          currentSection={
            currentSection
          }
          overviewHref={
            `/clients/${clientId}/organizer-review/${taxYear}`
          }
        />

        {showReadinessCard && (
          <OrganizerReviewReadinessCard
            progress={
              progress
            }
            preparationHref={
              preparationHref
            }
          />
        )}
      </div>
    )
  }

  return (
    <OrganizerReviewLayout
      breadcrumbs={
        breadcrumbs
      }
      header={
        header
      }
      actions={
        actions
      }
      sidebar={
        sidebar
      }
    >
      {showProgressHeader &&
        progress && (
        <OrganizerReviewProgressHeader
          progress={
            progress
          }
        />
      )}

      {children}
    </OrganizerReviewLayout>
  )
}
