import {
  Activity,
} from "lucide-react"

import type {
  TaxReturnActivity,
} from "@/features/returns/types/return.types"
import {
  formatReturnActivityLabel,
  formatReturnDateTime,
  formatReturnRelativeDate,
} from "@/features/returns/utils/return-formatters"

interface ReturnActivityTimelineProps {
  activities: TaxReturnActivity[]
}

export function ReturnActivityTimeline({
  activities,
}: ReturnActivityTimelineProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <Activity
            className="size-5 text-blue-700"
            aria-hidden="true"
          />

          <div>
            <h2 className="font-bold text-slate-950">
              Return activity
            </h2>

            <p className="text-sm text-slate-500">
              Recent audited changes
            </p>
          </div>
        </div>
      </header>

      {activities.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-medium text-slate-700">
            No activity recorded
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Return changes will appear here.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-slate-100">
          {activities.map(
            (activity) => (
              <li
                key={activity.id}
                className="p-5"
              >
                <div className="flex gap-3">
                  <span
                    className="mt-2 size-2.5 shrink-0 rounded-full bg-blue-600"
                    aria-hidden="true"
                  />

                  <div className="min-w-0">
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold">
                        {activity.actorName}
                      </span>{" "}
                      {formatReturnActivityLabel(
                        activity.action,
                      )}
                    </p>

                    <p
                      className="mt-1 text-xs text-slate-500"
                      title={formatReturnDateTime(
                        activity.occurredAt,
                      )}
                    >
                      {formatReturnRelativeDate(
                        activity.occurredAt,
                      )}
                    </p>
                  </div>
                </div>
              </li>
            ),
          )}
        </ol>
      )}
    </section>
  )
}