import {
  CheckCircle2,
  Clock3,
  MessageSquareText,
  RotateCcw,
  TriangleAlert,
} from "lucide-react"

import {
  useState,
} from "react"

import {
  useOrganizerReviewTimeline,
} from "@/features/organizer-review/hooks/use-organizer-review-timeline"

import type {
  OrganizerReviewTimelineEventType,
  OrganizerReviewTimelineSectionKey,
  OrganizerReviewTimelineSubjectType,
} from "@/features/organizer-review/types/organizer-review-timeline.types"

interface ReviewTimelineProps {
  organizerId: string
  sectionKey:
    OrganizerReviewTimelineSectionKey
  subjectType:
    OrganizerReviewTimelineSubjectType
  subjectId: string
  title?: string
}

function formatTimelineDate(
  value: string,
): string {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    },
  ).format(
    date,
  )
}

function getEventPresentation(
  eventType:
    OrganizerReviewTimelineEventType,
) {
  switch (eventType) {
    case "marked_reviewed":
      return {
        label:
          "Marked Reviewed",
        icon:
          CheckCircle2,
      }

    case "needs_follow_up":
      return {
        label:
          "Needs Follow-up",
        icon:
          TriangleAlert,
      }

    case "returned_to_client":
      return {
        label:
          "Returned to Client",
        icon:
          RotateCcw,
      }

    case "resubmitted":
      return {
        label:
          "Client Resubmitted",
        icon:
          Clock3,
      }

    case "status_changed":
      return {
        label:
          "Status Changed",
        icon:
          Clock3,
      }

    default:
      return {
        label:
          "Staff Note",
        icon:
          MessageSquareText,
      }
  }
}

export function ReviewTimeline({
  organizerId,
  sectionKey,
  subjectType,
  subjectId,
  title = "Review Timeline",
}: ReviewTimelineProps) {
  const {
    entries,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    refresh,
    addStaffNote,
    clearMessages,
  } = useOrganizerReviewTimeline({
    organizerId,
    sectionKey,
    subjectType,
    subjectId,
  })

  const [
    noteText,
    setNoteText,
  ] = useState("")

  async function handleAddNote() {
    const didSave =
      await addStaffNote(
        noteText,
      )

    if (didSave) {
      setNoteText("")
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Staff Review
        </p>

        <h4 className="mt-1 text-base font-semibold text-slate-950">
          {title}
        </h4>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Entries are visible to authorized staff only and cannot be silently
          overwritten.
        </p>
      </div>

      <div className="mt-5">
        <label
          className="block"
          htmlFor={
            `review-timeline-note-${subjectId}`
          }
        >
          <span className="text-sm font-semibold text-slate-800">
            Add Staff Note
          </span>

          <textarea
            id={
              `review-timeline-note-${subjectId}`
            }
            value={
              noteText
            }
            onChange={(event) => {
              clearMessages()

              setNoteText(
                event.target.value,
              )
            }}
            disabled={
              isLoading ||
              isSaving
            }
            maxLength={10000}
            rows={4}
            placeholder="Add a new internal note to the review timeline."
            className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </label>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {noteText.length.toLocaleString()} / 10,000 characters
          </p>

          <button
            type="button"
            onClick={() => {
              void handleAddNote()
            }}
            disabled={
              isLoading ||
              isSaving ||
              noteText.trim().length ===
                0
            }
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving
              ? "Adding Note..."
              : "Add Staff Note"}
          </button>
        </div>
      </div>

      {successMessage && (
        <div
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-900"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"
          role="alert"
        >
          <p className="font-semibold text-red-950">
            Unable to load or update the timeline
          </p>

          <p className="mt-1 text-sm leading-6 text-red-900">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => {
              void refresh()
            }}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mt-6 border-t border-slate-200 pt-5">
        <h5 className="font-semibold text-slate-950">
          Timeline History
        </h5>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="h-4 w-40 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : entries.length ===
          0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
            No review timeline entries have been recorded yet.
          </div>
        ) : (
          <ol className="mt-4 space-y-3">
            {entries.map(
              (entry) => {
                const presentation =
                  getEventPresentation(
                    entry.eventType,
                  )

                const EventIcon =
                  presentation.icon

                return (
                  <li
                    key={
                      entry.entryId
                    }
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <EventIcon
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-950">
                              {
                                presentation.label
                              }
                            </p>

                            <p className="mt-0.5 text-sm text-slate-600">
                              {entry.actorName}
                            </p>
                          </div>

                          <time
                            dateTime={
                              entry.createdAt
                            }
                            className="text-xs text-slate-500"
                          >
                            {
                              formatTimelineDate(
                                entry.createdAt,
                              )
                            }
                          </time>
                        </div>

                        {entry.noteText && (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-800">
                            {entry.noteText}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                )
              },
            )}
          </ol>
        )}
      </div>
    </section>
  )
}
