import {
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  FileCheck2,
  FileText,
  Flag,
} from "lucide-react"

import type {
  LucideIcon,
} from "lucide-react"

import type {
  ClientTaxReturnItem,
} from "@/features/returns/types/return.types"
import {
  formatReturnDate,
  taxFormLabels,
} from "@/features/returns/utils/return-formatters"

interface ClientTaxSeasonTimelineProps {
  clientReturns: ClientTaxReturnItem[]
}

type TimelineStatus =
  | "complete"
  | "current"
  | "upcoming"
  | "overdue"

interface TimelineItem {
  id: string
  title: string
  description: string
  dateValue: string | null
  status: TimelineStatus
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
  return (
    Boolean(taxReturn.dueDate) &&
    !closedStatuses.has(taxReturn.status) &&
    new Date(
      taxReturn.dueDate!,
    ).getTime() < getStartOfToday()
  )
}

function getTimelineItems(
  taxReturn: ClientTaxReturnItem,
): TimelineItem[] {
  const returnLabel = `${taxReturn.taxYear} ${
    taxFormLabels[taxReturn.taxForm]
  }`

  const items: TimelineItem[] = [
    {
      id: `${taxReturn.id}-received`,
      title: "Return received",
      description: `${returnLabel} entered the workflow.`,
      dateValue: taxReturn.dateReceived,
      status: "complete",
      icon: FileText,
    },
  ]

  if (taxReturn.dueDate) {
    items.push({
      id: `${taxReturn.id}-due`,
      title: isOverdue(taxReturn)
        ? "Filing deadline overdue"
        : "Filing deadline",
      description: `${returnLabel} filing deadline.`,
      dateValue: taxReturn.dueDate,
      status: isOverdue(taxReturn)
        ? "overdue"
        : closedStatuses.has(
              taxReturn.status,
            )
          ? "complete"
          : "upcoming",
      icon: CalendarClock,
    })
  }

  if (taxReturn.filedDate) {
    items.push({
      id: `${taxReturn.id}-filed`,
      title: "Return filed",
      description: `${returnLabel} was filed.`,
      dateValue: taxReturn.filedDate,
      status: "complete",
      icon: Flag,
    })
  } else if (
    !closedStatuses.has(
      taxReturn.status,
    )
  ) {
    items.push({
      id: `${taxReturn.id}-awaiting-file`,
      title: "Awaiting filing",
      description: `${returnLabel} has not been marked as filed.`,
      dateValue: null,
      status: "current",
      icon: Clock3,
    })
  }

  if (taxReturn.acceptedDate) {
    items.push({
      id: `${taxReturn.id}-accepted`,
      title: "Return accepted",
      description: `${returnLabel} was accepted.`,
      dateValue: taxReturn.acceptedDate,
      status: "complete",
      icon: FileCheck2,
    })
  } else if (taxReturn.filedDate) {
    items.push({
      id: `${taxReturn.id}-awaiting-acceptance`,
      title: "Awaiting acceptance",
      description: `${returnLabel} has been filed and is awaiting acceptance.`,
      dateValue: null,
      status: "current",
      icon: CalendarCheck2,
    })
  }

  return items
}

const statusStyles = {
  complete: {
    iconBackground:
      "bg-emerald-100",
    icon:
      "text-emerald-700",
    line:
      "bg-emerald-200",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    label:
      "Complete",
  },
  current: {
    iconBackground:
      "bg-blue-100",
    icon:
      "text-blue-700",
    line:
      "bg-blue-200",
    badge:
      "border-blue-200 bg-blue-50 text-blue-800",
    label:
      "Current",
  },
  upcoming: {
    iconBackground:
      "bg-slate-100",
    icon:
      "text-slate-600",
    line:
      "bg-slate-200",
    badge:
      "border-slate-200 bg-slate-50 text-slate-700",
    label:
      "Upcoming",
  },
  overdue: {
    iconBackground:
      "bg-red-100",
    icon:
      "text-red-700",
    line:
      "bg-red-200",
    badge:
      "border-red-200 bg-red-50 text-red-800",
    label:
      "Overdue",
  },
} as const

export function ClientTaxSeasonTimeline({
  clientReturns,
}: ClientTaxSeasonTimelineProps) {
  const activeReturn =
    [...clientReturns].sort(
      (firstReturn, secondReturn) => {
        if (
          secondReturn.taxYear !==
          firstReturn.taxYear
        ) {
          return (
            secondReturn.taxYear -
            firstReturn.taxYear
          )
        }

        return (
          new Date(
            secondReturn.updatedAt,
          ).getTime() -
          new Date(
            firstReturn.updatedAt,
          ).getTime()
        )
      },
    )[0]

  if (!activeReturn) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CalendarClock
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Tax Season Workflow
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Tax Season Timeline
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create a tax return to begin tracking filing milestones.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const timelineItems =
    getTimelineItems(activeReturn)

  const returnLabel = `${activeReturn.taxYear} ${
    taxFormLabels[
      activeReturn.taxForm
    ]
  }`

  return (
    <section
      aria-labelledby="client-tax-season-timeline-heading"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <CalendarClock
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Tax Season Workflow
            </p>

            <h2
              id="client-tax-season-timeline-heading"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              Tax Season Timeline
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Key milestones for the most recent return.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Active Return
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {returnLabel}
          </p>
        </div>
      </div>

      <div className="mt-7">
        {timelineItems.map(
          (item, index) => {
            const Icon =
              item.icon

            const styles =
              statusStyles[item.status]

            const isLast =
              index ===
              timelineItems.length - 1

            return (
              <div
                key={item.id}
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                {!isLast && (
                  <div
                    className={[
                      "absolute left-5 top-10 h-[calc(100%-0.5rem)] w-px",
                      styles.line,
                    ].join(" ")}
                    aria-hidden="true"
                  />
                )}

                <div
                  className={[
                    "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full",
                    styles.iconBackground,
                    styles.icon,
                  ].join(" ")}
                >
                  <Icon
                    className="size-4"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>

                    <span
                      className={[
                        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                        styles.badge,
                      ].join(" ")}
                    >
                      {styles.label}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                    {item.status ===
                    "complete" ? (
                      <CheckCircle2
                        className="size-4"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="size-4"
                        aria-hidden="true"
                      />
                    )}

                    <span>
                      {item.dateValue
                        ? formatReturnDate(
                            item.dateValue,
                          )
                        : "Date pending"}
                    </span>
                  </div>
                </div>
              </div>
            )
          },
        )}
      </div>
    </section>
  )
}
