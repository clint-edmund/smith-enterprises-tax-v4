import {
  CircleDollarSign,
  FileCheck2,
  FileText,
  LogIn,
  RefreshCw,
  Upload,
  UserPlus,
  UserRoundPen,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import type {
  DashboardActivity,
} from "@/features/dashboard/types/activity.types"
import {
  formatActivityDescription,
  formatActivityTimestamp,
  getActivityRoute,
} from "@/features/dashboard/utils/activity-formatters"

interface ActivityItemProps {
  activity: DashboardActivity
}

export function ActivityItem({
  activity,
}: ActivityItemProps) {
  const route = getActivityRoute(activity)

  const content = (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
        {getActivityIcon(activity.action)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-950">
            {activity.actorName || "System"}
          </span>{" "}
          {formatActivityDescription(activity)}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {formatActivityTimestamp(
            activity.occurredAt,
          )}
        </p>
      </div>
    </div>
  )

  if (!route) {
    return (
      <li className="px-1 py-4">
        {content}
      </li>
    )
  }

  return (
    <li>
      <Link
        className="block rounded-lg px-1 py-4 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        to={route}
      >
        {content}
      </Link>
    </li>
  )
}

function getActivityIcon(
  action: string,
) {
  const iconClassName = "h-5 w-5"

  switch (action) {
    case "client_created":
      return (
        <UserPlus
          aria-hidden="true"
          className={iconClassName}
        />
      )

    case "client_updated":
      return (
        <UserRoundPen
          aria-hidden="true"
          className={iconClassName}
        />
      )

    case "return_created":
      return (
        <FileText
          aria-hidden="true"
          className={iconClassName}
        />
      )

    case "return_updated":
    case "return_status_changed":
      return (
        <FileCheck2
          aria-hidden="true"
          className={iconClassName}
        />
      )

    case "payment_recorded":
      return (
        <CircleDollarSign
          aria-hidden="true"
          className={iconClassName}
        />
      )

    case "document_uploaded":
      return (
        <Upload
          aria-hidden="true"
          className={iconClassName}
        />
      )

    case "user_signed_in":
      return (
        <LogIn
          aria-hidden="true"
          className={iconClassName}
        />
      )

    default:
      return (
        <RefreshCw
          aria-hidden="true"
          className={iconClassName}
        />
      )
  }
}