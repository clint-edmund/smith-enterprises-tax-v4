import type { ClientDocument } from "../types/document.types"

interface UnmatchedDocumentsQueueProps {
  documents: ClientDocument[]
  matchedDocumentIds: Set<string>
  suggestedDocumentIds: Set<string>
}

export function UnmatchedDocumentsQueue({
  documents,
  matchedDocumentIds,
  suggestedDocumentIds,
}: UnmatchedDocumentsQueueProps) {
  const unmatchedDocuments = documents.filter(
    (document) =>
      !matchedDocumentIds.has(document.id) &&
      !suggestedDocumentIds.has(document.id),
  )

  if (unmatchedDocuments.length === 0) {
    return (
      <section className="rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-green-950">
              Unmatched Document Queue
            </h3>

            <p className="mt-1 text-sm text-green-800">
              All uploaded documents are linked or have a suggested match.
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
            Clear
          </span>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Unmatched Document Queue
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Review uploaded documents that are not linked to a checklist item.
          </p>
        </div>

        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
          {unmatchedDocuments.length}{" "}
          {unmatchedDocuments.length === 1
            ? "Document"
            : "Documents"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {unmatchedDocuments.map((document) => (
          <div
            key={document.id}
            className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold text-slate-900">
                {document.originalFileName}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                This document has not been matched to a required document.
              </p>
            </div>

            <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
              Needs Review
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}