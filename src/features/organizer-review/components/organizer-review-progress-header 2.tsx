import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  ListChecks,
} from "lucide-react"

import type {
  OrganizerReviewProgress,
} from "@/features/organizer-review/types"

interface OrganizerReviewProgressHeaderProps {
  progress:
    OrganizerReviewProgress
}

export function OrganizerReviewProgressHeader({
  progress,
}: OrganizerReviewProgressHeaderProps) {
  const remainingSectionCount =
    Math.max(
      0,
      progress.requiredSectionCount -
        progress.completedRequiredSectionCount,
    )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Organizer Review Progress
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {
              progress.progressPercentage
            }
            % Complete
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {
              progress.completedRequiredSectionCount
            }{" "}
            of{" "}
            {
              progress.requiredSectionCount
            }{" "}
            required sections are complete.
          </p>
        </div>

        <div
          className={[
            "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
            progress.isReadyForPreparation
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-700",
          ].join(" ")}
        >
          {progress.isReadyForPreparation ? (
            <CheckCircle2
              className="h-4 w-4"
              aria-hidden="true"
            />
          ) : (
            <ListChecks
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}

          {progress.isReadyForPreparation
            ? "Review Complete"
            : `${remainingSectionCount} Remaining`}
        </div>
      </div>

      <div
        className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label="Organizer review completion"
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

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <CheckCircle2
              className="h-4 w-4 text-emerald-700"
              aria-hidden="true"
            />

            Completed
          </dt>

          <dd className="mt-2 text-2xl font-bold text-slate-950">
            {
              progress.completedRequiredSectionCount
            }
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ListChecks
              className="h-4 w-4 text-blue-700"
              aria-hidden="true"
            />

            Remaining
          </dt>

          <dd className="mt-2 text-2xl font-bold text-slate-950">
            {
              remainingSectionCount
            }
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <AlertTriangle
              className="h-4 w-4 text-amber-700"
              aria-hidden="true"
            />

            Blocking Issues
          </dt>

          <dd className="mt-2 text-2xl font-bold text-slate-950">
            {
              progress.blockingIssueCount
            }
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <FileWarning
              className="h-4 w-4 text-orange-700"
              aria-hidden="true"
            />

            Missing Documents
          </dt>

          <dd className="mt-2 text-2xl font-bold text-slate-950">
            {
              progress.missingDocumentCount
            }
          </dd>
        </div>
      </dl>
    </section>
  )
}
