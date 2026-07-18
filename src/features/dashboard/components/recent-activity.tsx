import {
  Activity,
  RefreshCw,
} from "lucide-react"

import type {
  DashboardActivity,
} from "@/features/dashboard/types/activity.types"

import type {
  ActivityRealtimeStatus,
} from "@/features/dashboard/hooks/use-recent-activity-realtime"

interface RecentActivityProps {
  activities: DashboardActivity[]
  isRefreshing?: boolean
  errorMessage?: string | null
  onRefresh?: () => void
  realtimeStatus?: ActivityRealtimeStatus
}

export function RecentActivity({
  activities,
  isRefreshing = false,
  errorMessage = null,
  onRefresh,
  realtimeStatus = "disconnected",
}: RecentActivityProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Activity
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-950">
                Recent Activity
              </h2>

              <RealtimeStatusBadge
                status={realtimeStatus}
              />
            </div>

            <p className="text-sm text-slate-500">
              Latest activity across the tax office
            </p>
          </div>
        </div>

        {onRefresh ? (
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRefreshing}
            onClick={onRefresh}
            type="button"
          >
            <RefreshCw
              aria-hidden="true"
              className={`h-4 w-4 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            <span>
              {isRefreshing
                ? "Refreshing"
                : "Refresh"}
            </span>
          </button>
        ) : null}
      </div>

      <div className="px-6">
        {errorMessage ? (
          <div
            className="my-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
            role="alert"
          >
            <p className="text-sm font-medium text-amber-800">
              Recent activity could not be refreshed.
            </p>

            <p className="mt-1 text-sm text-amber-700">
              {errorMessage}
            </p>
          </div>
        ) : null}

        {!errorMessage &&
        activities.length === 0 ? (
          <div className="py-10 text-center">
            <Activity
              aria-hidden="true"
              className="mx-auto h-8 w-8 text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No recent activity
            </p>

            <p className="mt-1 text-sm text-slate-500">
              New client, return, and payment
              activity will appear here.
            </p>
          </div>
        ) : null}

        {activities.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <ActivityRow
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

interface ActivityRowProps {
  activity: DashboardActivity
}

function ActivityRow({
  activity,
}: ActivityRowProps) {
  return (
    <li className="py-4">
      <p className="text-sm text-slate-700">
        <span className="font-semibold text-slate-950">
          {activity.actorName}
        </span>{" "}
        {formatAction(activity.action)}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {formatActivityDate(
          activity.occurredAt,
        )}
      </p>
    </li>
  )
}

function formatAction(
  action: string,
): string {
  const descriptions: Record<
    string,
    string
  > = {
    client_created:
      "created a new client",
    client_updated:
      "updated a client",
    return_created:
      "created a tax return",
    return_updated:
      "updated a tax return",
    return_status_changed:
      "changed a return status",
    payment_recorded:
      "recorded a payment",
    document_uploaded:
      "uploaded a document",
    user_signed_in:
      "signed in",
  }

  return (
    descriptions[action] ??
    action.replaceAll("_", " ")
  )
}

function formatActivityDate(
  value: string,
): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Unknown time"
  }

  return date.toLocaleString()
}

function RealtimeStatusBadge({
  status,
}: {
  status: ActivityRealtimeStatus
}) {
  const statusDetails: Record<
    ActivityRealtimeStatus,
    {
      label: string
      className: string
    }
  > = {
    connected: {
      label: "Live",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    connecting: {
      label: "Connecting",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    disconnected: {
      label: "Offline",
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
    },

    error: {
      label: "Connection issue",
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  }

  const details =
    statusDetails[status]

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${details.className}`}
    >
      <span
        aria-hidden="true"
        className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"
      />

      {details.label}
    </span>
  )
}