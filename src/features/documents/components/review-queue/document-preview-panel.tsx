import {
  CalendarDays,
  FileText,
  UserRound,
  X,
} from "lucide-react"

import type {
  DocumentReviewQueueItem,
} from "@/features/documents/types/review-queue.types"

interface DocumentPreviewPanelProps {
  document: DocumentReviewQueueItem | null
  onClose: () => void
}

export function DocumentPreviewPanel({
  document,
  onClose,
}: DocumentPreviewPanelProps) {
  if (!document) {
    return null
  }

  return (
    <aside className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Document Preview
          </h2>

          <p className="text-sm text-slate-500">
            Review document details
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-6">

        <div>
          <div className="flex items-center gap-2 text-slate-700">
            <FileText className="h-4 w-4" />
            <span className="font-medium">
              {document.originalFileName}
            </span>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Client
          </h3>

          <p className="font-medium text-slate-900">
            {document.clientName}
          </p>

          {document.clientNumber && (
            <p className="text-sm text-slate-500">
              Client #{document.clientNumber}
            </p>
          )}
        </div>

        <div className="grid gap-4">

          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />

            <span className="text-sm">
              {document.taxYear ?? "Unknown"} •{" "}
              {document.returnType ?? "Unknown"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-slate-400" />

            <span className="text-sm">
              {document.reviewRequestedByName ??
                "Unknown"}
            </span>
          </div>

        </div>

        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          PDF preview coming in Phase 10.7.2
        </div>

      </div>
    </aside>
  )
}