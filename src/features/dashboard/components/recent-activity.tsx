import {
  Activity,
} from "lucide-react"

import type {
  DashboardActivity,
} from "@/features/dashboard/types/dashboard.types"
import {
  formatActivityDate,
  formatActivityLabel,
} from "@/features/dashboard/utils/dashboard-formatters"

interface RecentActivityProps {
  activities: DashboardActivity[]
}

export function RecentActivity({
  activities,
}: RecentActivityProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Activity
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">
              Recent activity
            </h2>

            <p className="text-sm text-slate-500">
              Latest authorized system actions
            </p>
          </div>
        </div>
      </header>

      {activities.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-medium text-slate-700">
            No recent activity
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Application events will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="px-5 py-4"
            >
              <div className="flex gap-3">
                <span
                  className="mt-2 size-2 shrink-0 rounded-full bg-blue-600"
                  aria-hidden="true"
                />

                <div className="min-w-0">
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">
                      {activity.actorName}
                    </span>{" "}
                    {formatActivityLabel(
                      activity.action,
                    )}
                  </p>

                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {activity.entityType.replaceAll(
                      "_",
                      " ",
                    )}
                    {" · "}
                    {formatActivityDate(
                      activity.occurredAt,
                    )}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}