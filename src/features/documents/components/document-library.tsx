import {
  Archive,
  CheckSquare2,
  Download,
  FileArchive,
  LoaderCircle,
  SearchX,
  Square,
  X,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  DocumentCategoryGroup,
} from "@/features/documents/components/document-category-group"
import {
  DocumentPreviewModal,
} from "@/features/documents/components/document-preview-modal"
import {
  DocumentSearchBar,
} from "@/features/documents/components/document-search-bar"
import {
  useDocumentFavorites,
} from "@/features/documents/hooks/use-document-favorites"
import {
  archiveClientDocument,
  createDocumentDownloadUrl,
} from "@/features/documents/services/document-service"
import type {
  ClientDocument,
  DocumentCategory,
} from "@/features/documents/types/document.types"
import {
  documentCategories,
} from "@/features/documents/types/document.types"
import {
  documentCategoryLabels,
} from "@/features/documents/utils/document-utils"

interface DocumentLibraryProps {
  documents: ClientDocument[]
  onArchived: (
    documentId: string,
  ) => void
}

type BulkAction =
  | "download"
  | "archive"
  | null

interface BulkActionFailure {
  documentName: string
  message: string
}

function matchesSearch(
  document: ClientDocument,
  searchValue: string,
): boolean {
  const normalizedSearch =
    searchValue.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  return [
    document.originalFileName,
    document.description,
    document.uploadedByName,
    documentCategoryLabels[
      document.category
    ],
  ].some(
    (value) =>
      value
        ?.toLowerCase()
        .includes(normalizedSearch) ??
      false,
  )
}

function triggerDownload(
  url: string,
  fileName: string,
) {
  const anchor =
    window.document.createElement("a")

  anchor.href = url
  anchor.download = fileName
  anchor.rel = "noreferrer"
  anchor.style.display = "none"

  window.document.body.appendChild(
    anchor,
  )

  anchor.click()
  anchor.remove()
}

export function DocumentLibrary({
  documents,
  onArchived,
}: DocumentLibraryProps) {
  const [
    searchValue,
    setSearchValue,
  ] = useState("")

  const [
    showFavoritesOnly,
    setShowFavoritesOnly,
  ] = useState(false)

  const [
    previewDocumentId,
    setPreviewDocumentId,
  ] = useState<string | null>(null)

  const [
    selectedDocumentIds,
    setSelectedDocumentIds,
  ] = useState<Set<string>>(
    () => new Set(),
  )

  const [
    bulkAction,
    setBulkAction,
  ] = useState<BulkAction>(null)

  const [
    bulkMessage,
    setBulkMessage,
  ] = useState<string | null>(null)

  const [
    bulkFailures,
    setBulkFailures,
  ] = useState<
    BulkActionFailure[]
  >([])

  const {
    isFavorite,
    toggleFavorite,
  } = useDocumentFavorites()

  const filteredDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          matchesSearch(
            document,
            searchValue,
          ) &&
          (
            !showFavoritesOnly ||
            isFavorite(document.id)
          ),
      ),
    [
      documents,
      isFavorite,
      searchValue,
      showFavoritesOnly,
    ],
  )

  const groupedDocuments = useMemo(
    () =>
      documentCategories
        .map((category) => ({
          category,
          documents:
            filteredDocuments.filter(
              (document) =>
                document.category ===
                category,
            ),
        }))
        .filter(
          (
            group,
          ): group is {
            category: DocumentCategory
            documents: ClientDocument[]
          } =>
            group.documents.length > 0,
        ),
    [filteredDocuments],
  )

  const navigationDocuments =
    useMemo(
      () =>
        groupedDocuments.flatMap(
          (group) => group.documents,
        ),
      [groupedDocuments],
    )

  const selectedDocuments =
    useMemo(
      () =>
        documents.filter(
          (document) =>
            selectedDocumentIds.has(
              document.id,
            ),
        ),
      [
        documents,
        selectedDocumentIds,
      ],
    )

  const filteredDocumentIds =
    useMemo(
      () =>
        filteredDocuments.map(
          (document) => document.id,
        ),
      [filteredDocuments],
    )

  const allFilteredSelected =
    filteredDocumentIds.length > 0 &&
    filteredDocumentIds.every(
      (documentId) =>
        selectedDocumentIds.has(
          documentId,
        ),
    )

  const someFilteredSelected =
    filteredDocumentIds.some(
      (documentId) =>
        selectedDocumentIds.has(
          documentId,
        ),
    )

  const previewDocument =
    useMemo(
      () =>
        navigationDocuments.find(
          (document) =>
            document.id ===
            previewDocumentId,
        ) ?? null,
      [
        navigationDocuments,
        previewDocumentId,
      ],
    )

  const previewIndex =
    previewDocument
      ? navigationDocuments.findIndex(
          (document) =>
            document.id ===
            previewDocument.id,
        )
      : -1

  const hasPrevious =
    previewIndex > 0

  const hasNext =
    previewIndex >= 0 &&
    previewIndex <
      navigationDocuments.length - 1

  useEffect(() => {
    const currentDocumentIds =
      new Set(
        documents.map(
          (document) => document.id,
        ),
      )

    setSelectedDocumentIds(
      (current) => {
        const next = new Set(
          [...current].filter(
            (documentId) =>
              currentDocumentIds.has(
                documentId,
              ),
          ),
        )

        if (
          next.size === current.size
        ) {
          return current
        }

        return next
      },
    )
  }, [documents])

  function clearBulkFeedback() {
    setBulkMessage(null)
    setBulkFailures([])
  }

  function handlePreview(
    document: ClientDocument,
  ) {
    setPreviewDocumentId(
      document.id,
    )
  }

  function handlePrevious() {
    if (!hasPrevious) {
      return
    }

    setPreviewDocumentId(
      navigationDocuments[
        previewIndex - 1
      ].id,
    )
  }

  function handleNext() {
    if (!hasNext) {
      return
    }

    setPreviewDocumentId(
      navigationDocuments[
        previewIndex + 1
      ].id,
    )
  }

  function handleSelectionChange(
    documentId: string,
    selected: boolean,
  ) {
    clearBulkFeedback()

    setSelectedDocumentIds(
      (current) => {
        const next =
          new Set(current)

        if (selected) {
          next.add(documentId)
        } else {
          next.delete(documentId)
        }

        return next
      },
    )
  }

  function handleSelectAllFiltered() {
    clearBulkFeedback()

    setSelectedDocumentIds(
      (current) => {
        const next =
          new Set(current)

        filteredDocumentIds.forEach(
          (documentId) =>
            next.add(documentId),
        )

        return next
      },
    )
  }

  function handleClearFilteredSelection() {
    clearBulkFeedback()

    setSelectedDocumentIds(
      (current) => {
        const next =
          new Set(current)

        filteredDocumentIds.forEach(
          (documentId) =>
            next.delete(documentId),
        )

        return next
      },
    )
  }

  function handleClearAllSelection() {
    clearBulkFeedback()
    setSelectedDocumentIds(
      new Set(),
    )
  }

  function handleArchived(
    documentId: string,
  ) {
    if (
      previewDocumentId ===
      documentId
    ) {
      setPreviewDocumentId(null)
    }

    setSelectedDocumentIds(
      (current) => {
        const next =
          new Set(current)

        next.delete(documentId)

        return next
      },
    )

    onArchived(documentId)
  }

  async function handleBulkDownload() {
    if (
      selectedDocuments.length === 0
    ) {
      return
    }

    setBulkAction("download")
    clearBulkFeedback()

    const failures:
      BulkActionFailure[] = []

    let downloadedCount = 0

    for (
      const document
      of selectedDocuments
    ) {
      try {
        const url =
          await createDocumentDownloadUrl(
            document,
          )

        triggerDownload(
          url,
          document.originalFileName,
        )

        downloadedCount += 1

        await new Promise<void>(
          (resolve) => {
            window.setTimeout(
              resolve,
              250,
            )
          },
        )
      } catch (error) {
        failures.push({
          documentName:
            document.originalFileName,
          message:
            error instanceof Error
              ? error.message
              : "Download failed.",
        })
      }
    }

    setBulkFailures(failures)

    if (failures.length === 0) {
      setBulkMessage(
        `${downloadedCount} ${
          downloadedCount === 1
            ? "document was"
            : "documents were"
        } prepared for download.`,
      )
    } else {
      setBulkMessage(
        `${downloadedCount} of ${selectedDocuments.length} documents were prepared for download.`,
      )
    }

    setBulkAction(null)
  }

  async function handleBulkArchive() {
    if (
      selectedDocuments.length === 0
    ) {
      return
    }

    const confirmed =
      window.confirm(
        `Archive ${
          selectedDocuments.length
        } selected ${
          selectedDocuments.length === 1
            ? "document"
            : "documents"
        }?`,
      )

    if (!confirmed) {
      return
    }

    setBulkAction("archive")
    clearBulkFeedback()

    const failures:
      BulkActionFailure[] = []

    const archivedIds:
      string[] = []

    for (
      const document
      of selectedDocuments
    ) {
      try {
        await archiveClientDocument(
          document.id,
        )

        archivedIds.push(
          document.id,
        )

        onArchived(document.id)
      } catch (error) {
        failures.push({
          documentName:
            document.originalFileName,
          message:
            error instanceof Error
              ? error.message
              : "Archive failed.",
        })
      }
    }

    if (
      previewDocumentId &&
      archivedIds.includes(
        previewDocumentId,
      )
    ) {
      setPreviewDocumentId(null)
    }

    setSelectedDocumentIds(
      (current) => {
        const next =
          new Set(current)

        archivedIds.forEach(
          (documentId) =>
            next.delete(documentId),
        )

        return next
      },
    )

    setBulkFailures(failures)

    if (failures.length === 0) {
      setBulkMessage(
        `${archivedIds.length} ${
          archivedIds.length === 1
            ? "document was"
            : "documents were"
        } archived.`,
      )
    } else {
      setBulkMessage(
        `${archivedIds.length} of ${selectedDocuments.length} documents were archived.`,
      )
    }

    setBulkAction(null)
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <FileArchive className="mx-auto size-8 text-slate-400" />

        <h3 className="mt-3 font-semibold text-slate-900">
          No documents uploaded
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Use the upload area above
          to add the first document.
        </p>
      </div>
    )
  }

  const selectionDisabled =
    bulkAction !== null

  return (
    <>
      <DocumentSearchBar
        onFavoritesChange={
          setShowFavoritesOnly
        }
        onSearchChange={
          setSearchValue
        }
        resultCount={
          filteredDocuments.length
        }
        searchValue={searchValue}
        showFavoritesOnly={
          showFavoritesOnly
        }
      />

      {filteredDocuments.length >
      0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {allFilteredSelected ? (
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                  disabled={
                    selectionDisabled
                  }
                  onClick={
                    handleClearFilteredSelection
                  }
                  type="button"
                >
                  <CheckSquare2 className="size-4" />
                  Clear Filtered
                </button>
              ) : (
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  disabled={
                    selectionDisabled
                  }
                  onClick={
                    handleSelectAllFiltered
                  }
                  type="button"
                >
                  <Square className="size-4" />
                  Select All Filtered
                </button>
              )}

              <span className="text-sm font-semibold text-slate-700">
                {
                  selectedDocuments.length
                }{" "}
                selected
              </span>

              {someFilteredSelected ||
              selectedDocuments.length >
                0 ? (
                <button
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                  disabled={
                    selectionDisabled
                  }
                  onClick={
                    handleClearAllSelection
                  }
                  type="button"
                >
                  <X className="size-4" />
                  Clear All
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  selectedDocuments.length ===
                    0 ||
                  selectionDisabled
                }
                onClick={() =>
                  void handleBulkDownload()
                }
                type="button"
              >
                {bulkAction ===
                "download" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}

                Download (
                {
                  selectedDocuments.length
                }
                )
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  selectedDocuments.length ===
                    0 ||
                  selectionDisabled
                }
                onClick={() =>
                  void handleBulkArchive()
                }
                type="button"
              >
                {bulkAction ===
                "archive" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Archive className="size-4" />
                )}

                Archive (
                {
                  selectedDocuments.length
                }
                )
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {bulkMessage ? (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-800">
          {bulkMessage}
        </div>
      ) : null}

      {bulkFailures.length > 0 ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-800">
            Some operations failed
          </p>

          <ul className="mt-2 space-y-1 text-sm text-red-700">
            {bulkFailures.map(
              (failure) => (
                <li
                  key={`${failure.documentName}-${failure.message}`}
                >
                  <span className="font-semibold">
                    {
                      failure.documentName
                    }
                  </span>
                  : {failure.message}
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}

      {filteredDocuments.length ===
      0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <SearchX className="mx-auto size-8 text-slate-400" />

          <h3 className="mt-3 font-semibold text-slate-900">
            No matching documents
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Clear the search or
            favorites filter to see
            more documents.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {groupedDocuments.map(
            (group) => (
              <DocumentCategoryGroup
                category={
                  group.category
                }
                documents={
                  group.documents
                }
                isFavorite={
                  isFavorite
                }
                isSelected={(
                  documentId,
                ) =>
                  selectedDocumentIds.has(
                    documentId,
                  )
                }
                key={
                  group.category
                }
                onArchived={
                  handleArchived
                }
                onPreview={
                  handlePreview
                }
                onSelectionChange={
                  handleSelectionChange
                }
                onToggleFavorite={
                  toggleFavorite
                }
                selectionDisabled={
                  selectionDisabled
                }
              />
            ),
          )}
        </div>
      )}

      <DocumentPreviewModal
        document={previewDocument}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onClose={() =>
          setPreviewDocumentId(null)
        }
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  )
}