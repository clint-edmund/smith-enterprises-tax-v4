import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Info,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
} from "lucide-react"

import type {
  LucideIcon,
} from "lucide-react"

import type {
  ClientRecord,
} from "@/features/clients/types/client.types"
import type {
  ClientTaxReturnItem,
} from "@/features/returns/types/return.types"

interface ClientSmartAlertsProps {
  client: ClientRecord
  clientReturns: ClientTaxReturnItem[]
}

type AlertSeverity =
  | "critical"
  | "high"
  | "medium"
  | "information"
  | "success"

interface SmartAlert {
  id: string
  severity: AlertSeverity
  title: string
  description: string
  icon: LucideIcon
}

const closedStatuses = new Set([
  "completed",
  "accepted",
])

function getStartOfToday(): number {
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  return today.getTime()
}

function isOverdue(
  taxReturn: ClientTaxReturnItem,
): boolean {
  if (
    !taxReturn.dueDate ||
    closedStatuses.has(taxReturn.status)
  ) {
    return false
  }

  return (
    new Date(taxReturn.dueDate).getTime() <
    getStartOfToday()
  )
}

function getDaysSince(
  dateValue: string,
): number {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 0
  }

  const difference =
    Date.now() - date.getTime()

  return Math.floor(
    difference /
      (1000 * 60 * 60 * 24),
  )
}

function getSmartAlerts(
  client: ClientRecord,
  clientReturns: ClientTaxReturnItem[],
): SmartAlert[] {
  const alerts: SmartAlert[] = []

  const overdueReturns =
    clientReturns.filter(isOverdue)

  if (overdueReturns.length > 0) {
    alerts.push({
      id: "overdue-returns",
      severity: "critical",
      title: `${overdueReturns.length} overdue open ${
        overdueReturns.length === 1
          ? "return"
          : "returns"
      }`,
      description:
        "Review the overdue filing deadline and update the return workflow.",
      icon: ShieldAlert,
    })
  }

  if (client.status !== "active") {
    alerts.push({
      id: "inactive-client",
      severity: "high",
      title: "Client is not active",
      description: `The client status is currently ${client.status.replaceAll(
        "_",
        " ",
      )}.`,
      icon: CircleAlert,
    })
  }

  if (!client.addressLine1) {
    alerts.push({
      id: "missing-address",
      severity: "high",
      title: "Mailing address is missing",
      description:
        "Add a mailing address before sending tax documents or correspondence.",
      icon: MapPin,
    })
  }

  if (!client.email) {
    alerts.push({
      id: "missing-email",
      severity: "medium",
      title: "Email address is missing",
      description:
        "Add an email address to support digital communication.",
      icon: Mail,
    })
  }

  if (!client.phone) {
    alerts.push({
      id: "missing-phone",
      severity: "medium",
      title: "Primary phone number is missing",
      description:
        "Add a phone number so staff can reach the client quickly.",
      icon: Phone,
    })
  }

  if (!client.birthDate) {
    alerts.push({
      id: "missing-birth-date",
      severity: "medium",
      title: "Birth date is missing",
      description:
        "Complete the client profile with a birth date.",
      icon: AlertCircle,
    })
  }

  if (clientReturns.length === 0) {
    alerts.push({
      id: "no-returns",
      severity: "information",
      title: "No tax returns on file",
      description:
        "This client does not currently have a return in the portfolio.",
      icon: Info,
    })
  }

  const daysSinceUpdate =
    getDaysSince(client.updatedAt)

  if (daysSinceUpdate >= 365) {
    alerts.push({
      id: "stale-profile",
      severity: "information",
      title: "Client profile may be outdated",
      description: `The client record has not been updated in ${daysSinceUpdate} days.`,
      icon: CalendarClock,
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "all-clear",
      severity: "success",
      title: "No smart alerts",
      description:
        "The client profile and return portfolio do not currently require attention.",
      icon: CheckCircle2,
    })
  }

  const severityOrder: Record<
    AlertSeverity,
    number
  > = {
    critical: 0,
    high: 1,
    medium: 2,
    information: 3,
    success: 4,
  }

  return alerts.sort(
    (firstAlert, secondAlert) =>
      severityOrder[firstAlert.severity] -
      severityOrder[secondAlert.severity],
  )
}

const alertStyles = {
  critical: {
    border: "border-red-200",
    background: "bg-red-50",
    iconBackground: "bg-red-100",
    icon: "text-red-700",
    badge:
      "border-red-200 bg-white text-red-800",
    label: "Critical",
  },
  high: {
    border: "border-orange-200",
    background: "bg-orange-50",
    iconBackground: "bg-orange-100",
    icon: "text-orange-700",
    badge:
      "border-orange-200 bg-white text-orange-800",
    label: "High",
  },
  medium: {
    border: "border-amber-200",
    background: "bg-amber-50",
    iconBackground: "bg-amber-100",
    icon: "text-amber-700",
    badge:
      "border-amber-200 bg-white text-amber-800",
    label: "Medium",
  },
  information: {
    border: "border-blue-200",
    background: "bg-blue-50",
    iconBackground: "bg-blue-100",
    icon: "text-blue-700",
    badge:
      "border-blue-200 bg-white text-blue-800",
    label: "Information",
  },
  success: {
    border: "border-emerald-200",
    background: "bg-emerald-50",
    iconBackground: "bg-emerald-100",
    icon: "text-emerald-700",
    badge:
      "border-emerald-200 bg-white text-emerald-800",
    label: "All Clear",
  },
} as const

export function ClientSmartAlerts({
  client,
  clientReturns,
}: ClientSmartAlertsProps) {
  const alerts =
    getSmartAlerts(
      client,
      clientReturns,
    )

  const attentionCount =
    alerts.filter(
      (alert) =>
        alert.severity !== "success",
    ).length

  return (
    <section
      aria-labelledby="client-smart-alerts-heading"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <AlertTriangle
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Proactive Review
            </p>

            <h2
              id="client-smart-alerts-heading"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              Smart Alerts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Issues and recommendations based on the current client record.
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
          {attentionCount === 0
            ? "No items"
            : `${attentionCount} ${
                attentionCount === 1
                  ? "item"
                  : "items"
              }`}
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {alerts.map((alert) => {
          const styles =
            alertStyles[alert.severity]

          const Icon =
            alert.icon

          return (
            <article
              key={alert.id}
              className={[
                "rounded-2xl border p-4",
                styles.border,
                styles.background,
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    styles.iconBackground,
                    styles.icon,
                  ].join(" ")}
                >
                  <Icon
                    className="size-5"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-950">
                      {alert.title}
                    </h3>

                    <span
                      className={[
                        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                        styles.badge,
                      ].join(" ")}
                    >
                      {styles.label}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {alert.description}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
