import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  ShieldAlert,
} from "lucide-react"

import type {
  ClientRecord,
} from "@/features/clients/types/client.types"
import type {
  ClientTaxReturnItem,
} from "@/features/returns/types/return.types"

interface ClientHealthCardProps {
  client: ClientRecord
  clientReturns: ClientTaxReturnItem[]
}

type HealthLevel =
  | "healthy"
  | "attention"
  | "action_required"

interface HealthResult {
  level: HealthLevel
  label: string
  description: string
  reasons: string[]
}

const closedStatuses = new Set([
  "completed",
  "accepted",
])

function isReturnOverdue(
  taxReturn: ClientTaxReturnItem,
): boolean {
  if (
    !taxReturn.dueDate ||
    closedStatuses.has(taxReturn.status)
  ) {
    return false
  }

  const dueDate = new Date(taxReturn.dueDate)
  const today = new Date()

  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate.getTime() < today.getTime()
}

function getClientHealth(
  client: ClientRecord,
  clientReturns: ClientTaxReturnItem[],
): HealthResult {
  const overdueReturns =
    clientReturns.filter(isReturnOverdue).length

  const missingContactItems = [
    !client.email ? "Email address is missing" : null,
    !client.phone ? "Primary phone number is missing" : null,
    !client.addressLine1
      ? "Mailing address is missing"
      : null,
  ].filter(
    (item): item is string =>
      Boolean(item),
  )

  if (
    client.status !== "active" ||
    overdueReturns > 0
  ) {
    const reasons = [
      client.status !== "active"
        ? `Client status is ${client.status.replaceAll(
            "_",
            " ",
          )}`
        : null,
      overdueReturns > 0
        ? `${overdueReturns} overdue open ${
            overdueReturns === 1
              ? "return"
              : "returns"
          }`
        : null,
      ...missingContactItems,
    ].filter(
      (item): item is string =>
        Boolean(item),
    )

    return {
      level: "action_required",
      label: "Action Required",
      description:
        "This client has an issue that should be reviewed promptly.",
      reasons,
    }
  }

  if (missingContactItems.length > 0) {
    return {
      level: "attention",
      label: "Needs Attention",
      description:
        "The client is active, but profile information is incomplete.",
      reasons: missingContactItems,
    }
  }

  return {
    level: "healthy",
    label: "Healthy",
    description:
      "No urgent client or return issues were detected.",
    reasons: [
      "Client status is active",
      "No overdue open returns",
      "Core contact information is complete",
    ],
  }
}

const healthStyles = {
  healthy: {
    border:
      "border-emerald-200",
    background:
      "bg-emerald-50",
    iconBackground:
      "bg-emerald-100",
    icon:
      "text-emerald-700",
    badge:
      "border-emerald-200 bg-white text-emerald-800",
    itemIcon:
      CheckCircle2,
  },
  attention: {
    border:
      "border-amber-200",
    background:
      "bg-amber-50",
    iconBackground:
      "bg-amber-100",
    icon:
      "text-amber-700",
    badge:
      "border-amber-200 bg-white text-amber-800",
    itemIcon:
      AlertTriangle,
  },
  action_required: {
    border:
      "border-red-200",
    background:
      "bg-red-50",
    iconBackground:
      "bg-red-100",
    icon:
      "text-red-700",
    badge:
      "border-red-200 bg-white text-red-800",
    itemIcon:
      ShieldAlert,
  },
} as const

export function ClientHealthCard({
  client,
  clientReturns,
}: ClientHealthCardProps) {
  const health =
    getClientHealth(
      client,
      clientReturns,
    )

  const styles =
    healthStyles[health.level]

  const ItemIcon =
    styles.itemIcon

  return (
    <section
      aria-labelledby="client-health-heading"
      className={[
        "rounded-3xl border p-6 shadow-sm",
        styles.border,
        styles.background,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={[
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              styles.iconBackground,
              styles.icon,
            ].join(" ")}
          >
            <HeartPulse
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Client Health
            </p>

            <h2
              id="client-health-heading"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              {health.label}
            </h2>
          </div>
        </div>

        <span
          className={[
            "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
            styles.badge,
          ].join(" ")}
        >
          {health.level === "healthy"
            ? "Good Standing"
            : health.level === "attention"
              ? "Review"
              : "Priority"}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">
        {health.description}
      </p>

      <ul className="mt-5 space-y-3">
        {health.reasons.map((reason) => (
          <li
            key={reason}
            className="flex gap-3 rounded-2xl border border-white/70 bg-white/70 p-3 text-sm text-slate-700"
          >
            <ItemIcon
              className={[
                "mt-0.5 size-4 shrink-0",
                styles.icon,
              ].join(" ")}
              aria-hidden="true"
            />

            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
