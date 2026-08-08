import type {
  DashboardActivity,
} from "@/features/dashboard/types/activity.types"

const activityDescriptions: Record<string, string> = {
  client_created: "created a new client",
  client_updated: "updated a client",
  return_created: "created a tax return",
  return_updated: "updated a tax return",
  return_status_changed: "changed a return status",
  payment_recorded: "recorded a payment",
  document_uploaded: "uploaded a document",
  user_signed_in: "signed in",
}

export function formatActivityDescription(
  activity: DashboardActivity,
): string {
  if (activity.description) {
    return activity.description
  }

  return (
    activityDescriptions[activity.action] ??
    formatUnknownActivityAction(activity.action)
  )
}

function formatUnknownActivityAction(
  action: string,
): string {
  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    )
}

export function formatActivityTimestamp(
  occurredAt: string,
): string {
  const activityDate = new Date(occurredAt)

  if (Number.isNaN(activityDate.getTime())) {
    return "Unknown time"
  }

  const now = new Date()
  const differenceInMilliseconds =
    now.getTime() - activityDate.getTime()

  const differenceInSeconds = Math.floor(
    differenceInMilliseconds / 1000,
  )

  if (differenceInSeconds < 0) {
    return activityDate.toLocaleString()
  }

  if (differenceInSeconds < 60) {
    return "Just now"
  }

  const differenceInMinutes = Math.floor(
    differenceInSeconds / 60,
  )

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes} ${
      differenceInMinutes === 1
        ? "minute"
        : "minutes"
    } ago`
  }

  const differenceInHours = Math.floor(
    differenceInMinutes / 60,
  )

  if (differenceInHours < 24) {
    return `${differenceInHours} ${
      differenceInHours === 1
        ? "hour"
        : "hours"
    } ago`
  }

  const differenceInDays = Math.floor(
    differenceInHours / 24,
  )

  if (differenceInDays === 1) {
    return "Yesterday"
  }

  if (differenceInDays < 7) {
    return `${differenceInDays} days ago`
  }

  return activityDate.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  )
}

export function getActivityRoute(
  activity: DashboardActivity,
): string | null {
  if (!activity.entityId) {
    return null
  }

  switch (activity.entityType.toLowerCase()) {
    case "client":
      return `/clients/${activity.entityId}`

    case "return":
    case "tax_return":
      return `/returns/${activity.entityId}`

    default:
      return null
  }
}