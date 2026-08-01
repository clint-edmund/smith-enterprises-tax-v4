import {
  Ban,
  Circle,
  FileCheck2,
  FileText,
  MessageSquare,
  Pencil,
  StickyNote,
  Upload,
  UserCheck,
  WalletCards,
} from "lucide-react"

import type {
  Json,
} from "@/types/database.types"
import type {
  ReturnWorkflowEventType,
} from "@/features/returns/types/return-workflow.types"

export interface WorkflowTimelineEvent {
  id: string
  eventType: ReturnWorkflowEventType
  eventLabel: string
  eventDescription: string | null
  eventData: Json
  occurredAt: string
  actorName: string
  isClientVisible: boolean
}

interface WorkflowTimelineProps {
  events: WorkflowTimelineEvent[]
  emptyTitle?: string
  emptyDescription?: string
}

function formatEventDate(
  value: string,
): string {
  const parsedDate =
    new Date(value)

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(parsedDate)
}

function getEventIcon(
  eventType: ReturnWorkflowEventType,
) {
  switch (eventType) {
    case "payment_received":
      return WalletCards

    case "payment_voided":
      return Ban

    case "document_uploaded":
    case "document_version_uploaded":
      return Upload

    case "document_archived":
      return FileText

    case "document_review_requested":
    case "document_changes_requested":
      return Pencil

    case "document_approved":
      return FileCheck2

    case "preparer_assigned":
    case "reviewer_assigned":
      return UserCheck

    case "client_contacted":
    case "client_response_received":
      return MessageSquare

    case "internal_note":
      return StickyNote

    default:
      return Circle
  }
}

function getEventStyle(
  eventType: ReturnWorkflowEventType,
): string {
  switch (eventType) {
    case "payment_received":
    case "document_approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"

    case "payment_voided":
    case "document_archived":
      return "border-red-200 bg-red-50 text-red-700"

    case "document_review_requested":
    case "document_changes_requested":
      return "border-amber-200 bg-amber-50 text-amber-700"

    case "document_uploaded":
    case "document_version_uploaded":
      return "border-blue-200 bg-blue-50 text-blue-700"

    case "client_contacted":
    case "client_response_received":
      return "border-violet-200 bg-violet-50 text-violet-700"

    default:
      return "border-slate-200 bg-slate-50 text-slate-600"
  }
}

export function WorkflowTimeline({
  events,
  emptyTitle = "No workflow activity",
  emptyDescription =
    "Workflow events will appear here as activity is recorded.",
}: WorkflowTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <Circle
          className="mx-auto size-10 text-slate-300"
          aria-hidden="true"
        />

        <h3 className="mt-4 font-semibold text-slate-950">
          {emptyTitle}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {emptyDescription}
        </p>
      </div>
    )
  }

  return (
    <ol className="relative space-y-0">
      {events.map(
        (
          event,
          index,
        ) => {
          const Icon =
            getEventIcon(
              event.eventType,
            )

          const isLast =
            index ===
            events.length - 1

          return (
            <li
              key={event.id}
              className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4"
            >
              <div className="relative flex justify-center">
                {!isLast && (
                  <div
                    className="absolute bottom-0 top-11 w-px bg-slate-200"
                    aria-hidden="true"
                  />
                )}

                <div
                  className={`relative z-10 flex size-10 items-center justify-center rounded-full border ${getEventStyle(
                    event.eventType,
                  )}`}
                >
                  <Icon
                    className="size-4"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <article
                className={`pb-6 ${
                  isLast
                    ? ""
                    : "border-b border-slate-100"
                }`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {event.eventLabel}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {event.actorName ||
                        "System"}
                    </p>
                  </div>

                  <time
                    dateTime={event.occurredAt}
                    className="shrink-0 text-xs font-medium text-slate-500"
                  >
                    {formatEventDate(
                      event.occurredAt,
                    )}
                  </time>
                </div>

                {event.eventDescription && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {
                      event.eventDescription
                    }
                  </p>
                )}

                {!event.isClientVisible && (
                  <span className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    Internal
                  </span>
                )}
              </article>
            </li>
          )
        },
      )}
    </ol>
  )
}