import {
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
} from "lucide-react"

import {
  ReviewNotice,
} from "@/features/organizer-review/components/review-workspace/review-notice"

import type {
  ReviewChecklist as ReviewChecklistModel,
} from "@/features/organizer-review/types/review-checklist.types"

interface ReviewChecklistProps {
  checklist:
    ReviewChecklistModel | null
  isLoading: boolean
  savingItemId:
    string | null
  errorMessage:
    string | null
  successMessage:
    string | null
  onRetry: () => void
  onSetItemCompleted: (
    itemId: string,
    isCompleted: boolean,
  ) => Promise<boolean>
  onClearMessages: () => void
}

function formatCompletedAt(
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

export function ReviewChecklist({
  checklist,
  isLoading,
  savingItemId,
  errorMessage,
  successMessage,
  onRetry,
  onSetItemCompleted,
  onClearMessages,
}: ReviewChecklistProps) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Review Workspace
          </p>

          <h4 className="mt-1 text-base font-semibold text-slate-950">
            {checklist?.definitionName ??
              "Review Checklist"}
          </h4>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Complete every required verification before marking this review
            item as reviewed.
          </p>
        </div>

        {checklist && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
            <p className="font-semibold">
              {checklist.completedItems} of{" "}
              {checklist.totalItems} complete
            </p>

            <p className="mt-1 text-xs">
              {checklist.completionPercentage}% progress
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="mt-5 space-y-3">
          {Array.from({
            length: 5,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-slate-100"
              />
            ),
          )}
        </div>
      ) : checklist ? (
        <ul className="mt-5 space-y-3">
          {checklist.items.map(
            (item) => {
              const isSaving =
                savingItemId ===
                item.itemId

              return (
                <li
                  key={
                    item.itemId
                  }
                  className={[
                    "rounded-xl border p-4 transition",
                    item.isCompleted
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        void onSetItemCompleted(
                          item.itemId,
                          !item.isCompleted,
                        )
                      }}
                      disabled={
                        savingItemId !==
                          null
                      }
                      aria-pressed={
                        item.isCompleted
                      }
                      className={[
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-blue-400",
                        item.isCompleted
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white text-slate-500 hover:border-blue-500",
                        savingItemId !==
                          null
                          ? "cursor-not-allowed opacity-60"
                          : "",
                      ].join(" ")}
                    >
                      {isSaving ? (
                        <RotateCcw
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : item.isCompleted ? (
                        <CheckCircle2
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <ClipboardCheck
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      )}

                      <span className="sr-only">
                        {item.isCompleted
                          ? `Reopen ${item.label}`
                          : `Complete ${item.label}`}
                      </span>
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">
                          {item.label}
                        </p>

                        {item.isRequired && (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            Required
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {item.description}
                        </p>
                      )}

                      {item.isCompleted &&
                        item.completedAt && (
                          <p className="mt-2 text-xs text-emerald-800">
                            Completed by{" "}
                            <strong>
                              {item.completedByName ??
                                "Staff"}
                            </strong>{" "}
                            on{" "}
                            {formatCompletedAt(
                              item.completedAt,
                            )}
                          </p>
                        )}
                    </div>
                  </div>
                </li>
              )
            },
          )}
        </ul>
      ) : null}

      {successMessage && (
        <ReviewNotice
          tone="success"
          message={
            successMessage
          }
          onDismiss={
            onClearMessages
          }
        />
      )}

      {errorMessage && (
        <>
          <ReviewNotice
            tone="error"
            message={
              errorMessage
            }
            onDismiss={
              onClearMessages
            }
          />

          <button
            type="button"
            onClick={
              onRetry
            }
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50"
          >
            Try Again
          </button>
        </>
      )}
    </section>
  )
}
