import {
  Activity,
} from "lucide-react"

import {
  ActivityItem,
} from "@/features/dashboard/components/activity-item"
import type {
  DashboardActivity,
} from "@/features/dashboard/types/activity.types"

interface ActivityFeedProps {
  activities: DashboardActivity[]
  isLoading?: boolean
  errorMessage?: string | null
}

export function ActivityFeed({
  activities,
  isLoading = false,
  errorMessage = null,
}: ActivityFeedProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Activity
            aria-hidden="true"
            className="h-5 w-5"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Recent Activity
          </h2>

          <p className="text-sm text-slate-500">
            Latest activity across the tax office
          </p>
        </div>
      </div>

      <div className="px-6">
        {isLoading ? (
          <ActivityFeedLoading />
        ) : null}

        {!isLoading && errorMessage ? (
          <div
            className="my-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {errorMessage}
          </div>
        ) : null}

        {!isLoading &&
        !errorMessage &&
        activities.length === 0 ? (
          <ActivityFeedEmpty />
        ) : null}

        {!isLoading &&
        !errorMessage &&
        activities.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <ActivityItem
                activity={activity}
                key={activity.id}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

function ActivityFeedLoading() {
  return (
    <div
      aria-label="Loading recent activity"
      className="space-y-4 py-6"
      role="status"
    >
      {[1, 2, 3].map((item) => (
        <div
          className="flex animate-pulse gap-3"
          key={item}
        >
          <div className="h-10 w-10 rounded-full bg-slate-200" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/4 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivityFeedEmpty() {
  return (
    <div className="py-10 text-center">
      <Activity
        aria-hidden="true"
        className="mx-auto h-8 w-8 text-slate-300"
      />

      <p className="mt-3 text-sm font-medium text-slate-700">
        No recent activity
      </p>

      <p className="mt-1 text-sm text-slate-500">
        New client, return, and payment activity
        will appear here.
      </p>
    </div>
  )
}