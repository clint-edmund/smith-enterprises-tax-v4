import { useMemo, useState } from "react"

import { useRequiredDocuments } from "../hooks/use-required-documents";

import { findDocumentMatches } from "../utils/document-matching"

import type { ClientDocument } from "../types/document.types"

import { DocumentStatusBadge } from "./document-status-badge"
import { getDocumentStatus } from "../utils/get-document-status"
import { MissingDocumentsSummary } from "./missing-documents-summary"
import { UnmatchedDocumentsQueue } from "./unmatched-documents-queue"

const AUTO_LINK_CONFIDENCE_THRESHOLD = 85

interface RequiredDocumentsPanelProps {
  taxReturnId: string
  documents: ClientDocument[]
}

function formatCategoryName(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}


function getConfidenceLabel(confidencePercent: number): string {
  if (confidencePercent >= 85) {
    return "High Confidence";
  }

  if (confidencePercent >= 60) {
    return "Medium Confidence";
  }

  return "Low Confidence";
}

function getConfidenceClasses(confidencePercent: number): string {
  if (confidencePercent >= 85) {
    return "border-green-200 bg-green-50 text-green-800";
  }

  if (confidencePercent >= 60) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function RequiredDocumentsPanel({
  taxReturnId,
  documents,
}: RequiredDocumentsPanelProps) {
  const {
    requiredDocuments,
    groups,
    progress,
    isLoading,
    isInitializing,
    isUpdating,
    error,
    initialize,
    refresh,
    updateRequiredDocument,
  } = useRequiredDocuments(taxReturnId);

  const suggestedMatches = useMemo(
  () =>
    findDocumentMatches(
      requiredDocuments,
      documents,
    ),
  [requiredDocuments, documents],
);

  const suggestedRequiredDocumentIds = useMemo(
    () =>
      new Set(
        suggestedMatches.map(
          (match) => match.requiredDocumentId,
        ),
      ),
    [suggestedMatches],
  )

  const matchedDocumentIds = useMemo(
    () =>
      new Set(
        requiredDocuments
          .map(
            (document) =>
              document.matchedDocumentId,
          )
          .filter(
            (documentId): documentId is string =>
              Boolean(documentId),
          ),
      ),
    [requiredDocuments],
  )

  const suggestedUploadedDocumentIds = useMemo(
    () =>
      new Set(
        suggestedMatches.map(
          (match) => match.clientDocumentId,
        ),
      ),
    [suggestedMatches],
  )

  const highConfidenceMatches = useMemo(() => {
    const usedUploadedDocumentIds =
      new Set<string>()

    return suggestedMatches.filter((match) => {
      const requiredDocument =
        requiredDocuments.find(
          (document) =>
            document.id ===
            match.requiredDocumentId,
        )

      if (
        match.confidencePercent <
          AUTO_LINK_CONFIDENCE_THRESHOLD ||
        !requiredDocument ||
        requiredDocument.isComplete ||
        requiredDocument.matchedDocumentId ||
        usedUploadedDocumentIds.has(
          match.clientDocumentId,
        )
      ) {
        return false
      }

      usedUploadedDocumentIds.add(
        match.clientDocumentId,
      )

      return true
    })
  }, [suggestedMatches, requiredDocuments])

function getSuggestedMatch(
  requiredDocumentId: string,
) {
  return suggestedMatches.find(
    (match) =>
      match.requiredDocumentId ===
      requiredDocumentId,
  );
}

function getUploadedDocument(
  documentId: string,
) {
  return documents.find(
    (document) =>
      document.id === documentId,
  );
}

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function handleInitialize() {
    setActionMessage(null);

    try {
      const created = await initialize();

      if (created > 0) {
        setActionMessage(
          `${created} required document ${
            created === 1 ? "item was" : "items were"
          } added.`,
        );
      } else {
        setActionMessage(
          "The required document checklist is already initialized.",
        );
      }
    } catch {
      // The hook exposes the error message.
    }
  }

  async function handleCompletionChange(
    requiredDocumentId: string,
    isComplete: boolean,
  ) {
    setActionMessage(null);

    try {
      await updateRequiredDocument({
        requiredDocumentId,
        isComplete,
      });

      setActionMessage(
        isComplete
          ? "Required document marked complete."
          : "Required document marked incomplete.",
      );
    } catch {
      // The hook exposes the error message.
    }
  }

  async function handleAcceptSuggestion(
  requiredDocumentId: string,
  documentId: string,
) {
  setActionMessage(null);

  try {
    await updateRequiredDocument({
      requiredDocumentId,
      documentId,
      isComplete: true,
    });

    setActionMessage(
      "Uploaded document linked and checklist item marked complete.",
    );
  } catch {
    // The hook exposes the error message.
  }
}

  async function handleAutoLinkHighConfidence() {
  if (highConfidenceMatches.length === 0) {
    setActionMessage(
      "No high-confidence document matches are available.",
    )

    return
  }

  setActionMessage(null)

  try {
    let linkedCount = 0

    for (const match of highConfidenceMatches) {
      await updateRequiredDocument({
        requiredDocumentId:
          match.requiredDocumentId,
        documentId:
          match.clientDocumentId,
        isComplete: true,
      })

      linkedCount += 1
    }

    setActionMessage(
      `${linkedCount} high-confidence ${
        linkedCount === 1
          ? "document was"
          : "documents were"
      } linked successfully.`,
    )
  } catch {
    // The hook exposes the error message.
  }
}

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 w-56 rounded bg-slate-200" />

          <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-100" />

          <div className="mt-6 h-3 w-full rounded-full bg-slate-100" />

          <div className="mt-8 space-y-4">
            <div className="h-20 rounded-xl bg-slate-100" />
            <div className="h-20 rounded-xl bg-slate-100" />
            <div className="h-20 rounded-xl bg-slate-100" />
          </div>
        </div>
      </section>
    );
  }

  const hasDocuments = progress.total > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Required Documents
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Track the documents needed to prepare and complete this tax
              return.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void handleAutoLinkHighConfidence()
              }}
              disabled={
                isUpdating ||
                highConfidenceMatches.length === 0
              }
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating
                ? "Linking..."
                : `Link High Confidence (${highConfidenceMatches.length})`}
            </button>

            <button
              type="button"
              onClick={() => {
                void refresh();
              }}
              disabled={isLoading || isInitializing || isUpdating}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                void handleInitialize();
              }}
              disabled={isInitializing || isUpdating}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isInitializing
                ? "Initializing..."
                : hasDocuments
                  ? "Check for New Items"
                  : "Initialize Checklist"}
            </button>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        ) : null}

        {actionMessage ? (
          <div
            role="status"
            className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {actionMessage}
          </div>
        ) : null}
      </div>

      {!hasDocuments ? (
        <div className="p-6">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              No checklist items found
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
              Initialize the checklist to add the required documents that apply
              to this tax return.
            </p>

            <button
              type="button"
              onClick={() => {
                void handleInitialize();
              }}
              disabled={isInitializing}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isInitializing
                ? "Initializing..."
                : "Initialize Required Documents"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-slate-200 p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">
                  Overall Progress
                </p>

                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {progress.percentComplete}%
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">Completed</p>

                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {progress.completed} of {progress.total}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">Required</p>

                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {progress.requiredCompleted} of {progress.required}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">Optional</p>

                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {progress.optionalCompleted} of {progress.optional}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">
                  Checklist completion
                </span>

                <span className="text-slate-600">
                  {progress.completed}/{progress.total}
                </span>
              </div>

              <div
                className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-label="Required document completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.percentComplete}
              >
                <div
                  className="h-full rounded-full bg-blue-700 transition-all"
                  style={{
                    width: `${progress.percentComplete}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <MissingDocumentsSummary
              documents={requiredDocuments}
              suggestedDocumentIds={
                suggestedRequiredDocumentIds
              }
            />

            <UnmatchedDocumentsQueue
              documents={documents}
              matchedDocumentIds={matchedDocumentIds}
              suggestedDocumentIds={
                suggestedUploadedDocumentIds
              }
/>

            {groups.map((group) => {
              const completedCount = group.documents.filter(
                (document) => document.isComplete,
              ).length;

              return (
                <div
                  key={group.category}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {group.title || formatCategoryName(group.category)}
                      </h3>

                      <p className="text-sm text-slate-600">
                        {completedCount} of {group.documents.length} complete
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                      {formatCategoryName(group.category)}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {group.documents.map((document) => {
                      const suggestedMatch =
                        getSuggestedMatch(document.id)

                      const suggestedDocument =
                        suggestedMatch
                          ? getUploadedDocument(
                              suggestedMatch.clientDocumentId,
                            )
                          : undefined

                      const status = getDocumentStatus(document, {
                        hasSuggestedMatch: Boolean(
                          suggestedMatch && suggestedDocument,
                        ),
                      })

  return (
    <div
      key={document.id}
      className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex min-w-0 gap-3">
        <input
          id={`required-document-${document.id}`}
          type="checkbox"
          checked={document.isComplete}
          disabled={isUpdating}
          onChange={(event) => {
            void handleCompletionChange(
              document.id,
              event.target.checked,
            );
          }}
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-700 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="min-w-0">
          <label
            htmlFor={`required-document-${document.id}`}
            className={`font-medium ${
              document.isComplete
                ? "text-slate-500 line-through"
                : "text-slate-900"
            }`}
          >
            {document.name}
          </label>

          {document.description ? (
            <p className="mt-1 text-sm text-slate-600">
              {document.description}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                document.isRequired
                  ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200"
                  : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200"
              }`}
            >
              {document.isRequired
                ? "Required"
                : "Optional"}
            </span>

            <DocumentStatusBadge status={status} />

            {document.matchedDocumentName ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                {document.matchedDocumentName}
              </span>
            ) : null}
          </div>

          {document.notes ? (
            <p className="mt-2 text-sm text-slate-500">
              Notes: {document.notes}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:max-w-xs">
        {!document.isComplete &&
        suggestedMatch &&
        suggestedDocument ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Suggested Match
            </p>

            <p className="mt-1 break-words text-sm font-medium text-blue-950">
              {suggestedDocument.originalFileName}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getConfidenceClasses(
                  suggestedMatch.confidencePercent,
                )}`}
              >
                {getConfidenceLabel(
                  suggestedMatch.confidencePercent,
                )}
              </span>

              <span className="text-xs font-medium text-blue-700">
                {suggestedMatch.confidencePercent}% match
              </span>
            </div>

            {suggestedMatch.reasons.length > 0 ? (
              <p className="mt-2 text-xs text-blue-700">
                {suggestedMatch.reasons[0]}
              </p>
            ) : null}

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => {
                void handleAcceptSuggestion(
                  document.id,
                  suggestedDocument.id,
                );
              }}
              className="mt-3 inline-flex min-h-9 items-center justify-center rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Link Document
            </button>
          </div>
        ) : null}

        <button
          type="button"
          disabled={isUpdating}
          onClick={() => {
            void handleCompletionChange(
              document.id,
              !document.isComplete,
            );
          }}
          className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {document.isComplete
            ? "Mark Missing"
            : "Mark Complete"}
        </button>
      </div>
    </div>
  );
})}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
