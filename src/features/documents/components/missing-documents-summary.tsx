import type { RequiredReturnDocument } from "../types/required-document.types"

interface MissingDocumentsSummaryProps {
  documents: RequiredReturnDocument[]
  suggestedDocumentIds?: Set<string>
}

export function MissingDocumentsSummary({
  documents,
  suggestedDocumentIds = new Set<string>(),
}: MissingDocumentsSummaryProps) {
  const missingRequiredDocuments = documents.filter(
    (document) =>
      document.isRequired &&
      !document.isComplete &&
      !document.matchedDocumentId,
  )

  const suggestedRequiredDocuments =
    missingRequiredDocuments.filter((document) =>
      suggestedDocumentIds.has(document.id),
    )

  const unresolvedRequiredDocuments =
    missingRequiredDocuments.filter(
      (document) =>
        !suggestedDocumentIds.has(document.id),
    )

  const isReady =
    missingRequiredDocuments.length === 0

  return (
    <section
      className={`rounded-xl border p-5 ${
        isReady
          ? "border-green-200 bg-green-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3
            className={`text-base font-semibold ${
              isReady
                ? "text-green-950"
                : "text-amber-950"
            }`}
          >
            {isReady
              ? "Required Documents Complete"
              : "Required Documents Outstanding"}
          </h3>

          <p
            className={`mt-1 text-sm ${
              isReady
                ? "text-green-800"
                : "text-amber-800"
            }`}
          >
            {isReady
              ? "All required documents have been received."
              : `${missingRequiredDocuments.length} required ${
                  missingRequiredDocuments.length === 1
                    ? "document is"
                    : "documents are"
                } still outstanding.`}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
            isReady
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {isReady
            ? "Ready"
            : `${missingRequiredDocuments.length} Missing`}
        </span>
      </div>

      {!isReady ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-amber-950">
              Still Missing
            </h4>

            {unresolvedRequiredDocuments.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {unresolvedRequiredDocuments.map(
                  (document) => (
                    <li
                      key={document.id}
                      className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800"
                    >
                      {document.name}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-amber-800">
                No unresolved required documents.
              </p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-blue-950">
              Suggested Matches Available
            </h4>

            {suggestedRequiredDocuments.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {suggestedRequiredDocuments.map(
                  (document) => (
                    <li
                      key={document.id}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900"
                    >
                      {document.name}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                No suggested matches are currently available.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}