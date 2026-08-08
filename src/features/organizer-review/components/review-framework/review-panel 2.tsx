import type {
  ReactNode,
} from "react"

import {
  ReviewStatusPill,
  type SharedReviewStatus,
} from "./review-status-pill"

interface ReviewPanelProps {
  status:
    SharedReviewStatus
  reviewedByName?:
    string | null
  updatedLabel:
    string
  children:
    ReactNode
}

export function ReviewPanel({
  status,
  reviewedByName = null,
  updatedLabel,
  children,
}: ReviewPanelProps) {
  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Staff Review
          </p>

          <div className="mt-2">
            <ReviewStatusPill
              status={
                status
              }
              reviewedByName={
                reviewedByName
              }
            />
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Updated{" "}
          {
            updatedLabel
          }
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {children}
      </div>
    </section>
  )
}
