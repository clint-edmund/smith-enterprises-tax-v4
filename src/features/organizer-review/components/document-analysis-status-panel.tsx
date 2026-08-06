import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  XCircle,
} from "lucide-react"

import {
  ReviewNotice,
} from "@/features/organizer-review/components/review-workspace/review-notice"

import {
  useDocumentAnalysis,
} from "@/features/organizer-review/hooks/use-document-analysis"

interface DocumentAnalysisStatusPanelProps {
  documentId: string
  organizerId: string | null
  evidenceId: string | null
}

function formatDateTime(
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

const statusPresentation = {
  pending: {
    label:
      "Pending",
    icon:
      Clock3,
    classes:
      "border-slate-200 bg-slate-50 text-slate-800",
  },
  queued: {
    label:
      "Queued",
    icon:
      Clock3,
    classes:
      "border-blue-200 bg-blue-50 text-blue-800",
  },
  processing: {
    label:
      "Processing",
    icon:
      LoaderCircle,
    classes:
      "border-violet-200 bg-violet-50 text-violet-800",
  },
  completed: {
    label:
      "Completed",
    icon:
      CheckCircle2,
    classes:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  review_required: {
    label:
      "Review Required",
    icon:
      AlertTriangle,
    classes:
      "border-amber-200 bg-amber-50 text-amber-800",
  },
  failed: {
    label:
      "Failed",
    icon:
      XCircle,
    classes:
      "border-red-200 bg-red-50 text-red-800",
  },
  cancelled: {
    label:
      "Cancelled",
    icon:
      XCircle,
    classes:
      "border-slate-200 bg-slate-50 text-slate-700",
  },
} as const

export function DocumentAnalysisStatusPanel({
  documentId,
  organizerId,
  evidenceId,
}: DocumentAnalysisStatusPanelProps) {
  const {
    jobs,
    latestJob,
    isLoading,
    isQueueing,
    errorMessage,
    successMessage,
    refresh,
    queueAnalysis,
    clearMessages,
  } = useDocumentAnalysis(
    documentId,
  )

  const isActive =
    latestJob?.status ===
      "queued" ||
    latestJob?.status ===
      "processing"

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit
              className="h-5 w-5 text-blue-700"
              aria-hidden="true"
            />

            <h3 className="font-semibold text-slate-950">
              Document Analysis
            </h3>
          </div>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Queue this document for the provider-independent analysis workflow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void refresh()
          }}
          disabled={
            isLoading
          }
          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              isLoading
                ? "animate-spin"
                : "",
            ].join(" ")}
            aria-hidden="true"
          />

          <span className="sr-only">
            Refresh analysis history
          </span>
        </button>
      </div>

      {latestJob && (
        <div
          className={[
            "mt-4 rounded-xl border p-3",
            statusPresentation[
              latestJob.status
            ].classes,
          ].join(" ")}
        >
          <div className="flex items-center gap-2">
            {(() => {
              const Icon =
                statusPresentation[
                  latestJob.status
                ].icon

              return (
                <Icon
                  className={[
                    "h-4 w-4",
                    latestJob.status ===
                      "processing"
                      ? "animate-spin"
                      : "",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )
            })()}

            <p className="text-sm font-semibold">
              {
                statusPresentation[
                  latestJob.status
                ].label
              }
            </p>
          </div>

          <p className="mt-2 text-xs leading-5">
            Provider:{" "}
            <strong>
              {latestJob.providerName}
            </strong>
          </p>

          <p className="mt-1 text-xs leading-5">
            Requested by{" "}
            <strong>
              {latestJob.requestedByName}
            </strong>{" "}
            on{" "}
            {formatDateTime(
              latestJob.requestedAt,
            )}
          </p>

          {latestJob.failureMessage && (
            <p className="mt-2 text-xs font-medium">
              {latestJob.failureMessage}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          void queueAnalysis({
            organizerId,
            evidenceId,
            providerKey:
              "manual_test",
            metadata: {
              source:
                "document_review_workspace",
            },
          })
        }}
        disabled={
          isQueueing ||
          isActive
        }
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isQueueing ? (
          <LoaderCircle
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <BrainCircuit
            className="h-4 w-4"
            aria-hidden="true"
          />
        )}

        {isQueueing
          ? "Queueing Analysis…"
          : isActive
            ? "Analysis Already Active"
            : "Queue Analysis"}
      </button>

      {successMessage && (
        <ReviewNotice
          tone="success"
          message={
            successMessage
          }
          onDismiss={
            clearMessages
          }
        />
      )}

      {errorMessage && (
        <ReviewNotice
          tone="error"
          message={
            errorMessage
          }
          onDismiss={
            clearMessages
          }
        />
      )}

      {jobs.length >
        0 && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-slate-950">
            Analysis History
          </h4>

          <div className="mt-3 space-y-2">
            {jobs.map(
              (job) => (
                <div
                  key={
                    job.jobId
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-800">
                      {
                        statusPresentation[
                          job.status
                        ].label
                      }
                    </p>

                    <p className="text-xs text-slate-500">
                      {formatDateTime(
                        job.requestedAt,
                      )}
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-slate-600">
                    {job.providerName}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  )
}
