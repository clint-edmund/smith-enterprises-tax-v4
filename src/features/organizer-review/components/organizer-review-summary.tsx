import type {
  OrganizerReviewOverview,
} from "../types"

interface OrganizerReviewSummaryProps {
  overview: OrganizerReviewOverview
}

interface SummaryCardProps {
  label: string
  value: string | number
}

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  )
}

export function OrganizerReviewSummary({
  overview,
}: OrganizerReviewSummaryProps) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Ready for Review"
        value={
          overview.isReadyForReview
            ? "Yes"
            : "No"
        }
      />

      <SummaryCard
        label="Blocking Issues"
        value={
          overview.blockingIssueCount
        }
      />

      <SummaryCard
        label="Missing Documents"
        value={
          overview.missingDocumentCount
        }
      />

      <SummaryCard
        label="Completed Sections"
        value={`${overview.completedSectionCount} / ${overview.totalSectionCount}`}
      />
    </section>
  )
}