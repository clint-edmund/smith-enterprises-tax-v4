import type {
  OrganizerReviewOverview,
} from "../types"

interface OrganizerReviewHeaderProps {
  overview: OrganizerReviewOverview
}

export function OrganizerReviewHeader({
  overview,
}: OrganizerReviewHeaderProps) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Organizer Review
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            {overview.client.clientName}
          </h1>

          <p className="mt-2 text-slate-600">
            {overview.taxYear} Tax Organizer
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 px-6 py-4 text-center">
          <div className="text-4xl font-bold text-slate-900">
            {overview.overallProgressPercentage}%
          </div>

          <div className="text-sm text-slate-500">
            Complete
          </div>
        </div>
      </div>
    </header>
  )
}