import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock3,
  LockKeyhole,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

import {
  useOrganizerReviewProgress,
} from "@/features/organizer-review/hooks"

import type {
  OrganizerReviewWorkflowSectionKey,
} from "@/features/organizer-review/constants"

import type {
  OrganizerReviewProgressSection,
} from "@/features/organizer-review/types"

interface OrganizerReviewProgressSidebarProps {
  clientId: string
  taxYear: number
  currentSection?:
    OrganizerReviewWorkflowSectionKey
}

function getSectionIcon(
  section:
    OrganizerReviewProgressSection,
) {
  if (!section.isImplemented) {
    return (
      <LockKeyhole
        className="h-4 w-4"
        aria-hidden="true"
      />
    )
  }

  if (section.status === "complete") {
    return (
      <CheckCircle2
        className="h-4 w-4"
        aria-hidden="true"
      />
    )
  }

  if (
    section.status ===
    "needs_attention"
  ) {
    return (
      <AlertTriangle
        className="h-4 w-4"
        aria-hidden="true"
      />
    )
  }

  if (
    section.status ===
    "in_progress"
  ) {
    return (
      <Clock3
        className="h-4 w-4"
        aria-hidden="true"
      />
    )
  }

  return (
    <Circle
      className="h-4 w-4"
      aria-hidden="true"
    />
  )
}

function getSectionTone(
  section:
    OrganizerReviewProgressSection,
  isCurrent: boolean,
): string {
  if (isCurrent) {
    return "border-blue-300 bg-blue-50 text-blue-950"
  }

  if (!section.isImplemented) {
    return "border-slate-200 bg-slate-50 text-slate-400"
  }

  if (section.status === "complete") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900"
  }

  if (
    section.status ===
    "needs_attention"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-950"
  }

  if (
    section.status ===
    "in_progress"
  ) {
    return "border-blue-200 bg-white text-slate-900"
  }

  return "border-slate-200 bg-white text-slate-800"
}

function getStatusLabel(
  section:
    OrganizerReviewProgressSection,
): string {
  if (!section.isImplemented) {
    return "Planned"
  }

  if (section.status === "complete") {
    return "Complete"
  }

  if (
    section.status ===
    "needs_attention"
  ) {
    return "Needs Attention"
  }

  if (
    section.status ===
    "in_progress"
  ) {
    return "In Progress"
  }

  return "Not Started"
}

export function OrganizerReviewProgressSidebar({
  clientId,
  taxYear,
  currentSection,
}: OrganizerReviewProgressSidebarProps) {
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

  if (isLoading) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-100" />

          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="h-14 rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </aside>
    )
  }

  if (
    errorMessage ||
    !progress
  ) {
    return (
      <aside className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
        <p className="font-semibold text-slate-950">
          Organizer Review
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {errorMessage ??
            "Unable to load organizer progress."}
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
      </aside>
    )
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-lg font-semibold text-slate-950">
          Organizer Review
        </p>

        <p className="mt-1 text-sm text-slate-600">
          Tax Year {progress.taxYear}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-medium text-slate-700">
            Overall Progress
          </span>

          <span className="font-bold text-slate-950">
            {progress.progressPercentage}%
          </span>
        </div>

        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Organizer review progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={
            progress.progressPercentage
          }
        >
          <div
            className="h-full rounded-full bg-blue-700 transition-[width]"
            style={{
              width:
                `${progress.progressPercentage}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {progress.completedRequiredSectionCount} of{" "}
          {progress.requiredSectionCount}{" "}
          required sections complete
        </p>
      </div>

      <nav
        className="mt-6 space-y-2"
        aria-label="Organizer review sections"
      >
        {progress.sections.map(
          (section) => {
            const isCurrent =
              section.key ===
              currentSection

            const className = [
              "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
              getSectionTone(
                section,
                isCurrent,
              ),
              section.isImplemented
                ? "hover:border-blue-300 hover:bg-blue-50"
                : "cursor-not-allowed",
            ].join(" ")

            const content = (
              <>
                <span className="mt-0.5 shrink-0">
                  {getSectionIcon(
                    section,
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {section.title}
                  </span>

                  <span className="mt-0.5 block text-xs opacity-80">
                    {getStatusLabel(
                      section,
                    )}

                    {section.issueCount >
                      0 && (
                      <>
                        {" "}·{" "}
                        {section.issueCount}{" "}
                        issue
                        {section.issueCount ===
                        1
                          ? ""
                          : "s"}
                      </>
                    )}
                  </span>
                </span>
              </>
            )

            if (
              !section.isImplemented
            ) {
              return (
                <div
                  key={section.key}
                  className={className}
                  aria-disabled="true"
                >
                  {content}
                </div>
              )
            }

            return (
              <Link
                key={section.key}
                to={section.href}
                className={className}
                aria-current={
                  isCurrent
                    ? "page"
                    : undefined
                }
              >
                {content}
              </Link>
            )
          },
        )}
      </nav>

      <div className="mt-6 border-t border-slate-200 pt-5">
        {progress.isReadyForPreparation ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-950">
              Ready for Preparation
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-900">
              All required organizer review sections are complete.
            </p>
          </div>
        ) : progress.nextSection ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Next Recommended
            </p>

            <p className="mt-1 font-semibold text-blue-950">
              {progress.nextSection.title}
            </p>

            {progress.nextSection.isImplemented ? (
              <Link
                to={progress.nextSection.href}
                className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Continue Review
              </Link>
            ) : (
              <p className="mt-2 text-sm leading-6 text-blue-900">
                This review section is planned but has not been implemented yet.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
