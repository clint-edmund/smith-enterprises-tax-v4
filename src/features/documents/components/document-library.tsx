import { FileArchive, SearchX } from "lucide-react"
import { useMemo, useState } from "react"

import { DocumentCategoryGroup } from "@/features/documents/components/document-category-group"
import { DocumentPreviewModal } from "@/features/documents/components/document-preview-modal"
import { DocumentSearchBar } from "@/features/documents/components/document-search-bar"
import { useDocumentFavorites } from "@/features/documents/hooks/use-document-favorites"
import type { ClientDocument, DocumentCategory } from "@/features/documents/types/document.types"
import { documentCategories } from "@/features/documents/types/document.types"
import { documentCategoryLabels } from "@/features/documents/utils/document-utils"

interface DocumentLibraryProps {
  documents: ClientDocument[]
  onArchived: (documentId: string) => void
}

function matchesSearch(document: ClientDocument, searchValue: string): boolean {
  const normalizedSearch = searchValue.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  return [
    document.originalFileName,
    document.description ?? "",
    document.uploadedByName,
    document.status,
    documentCategoryLabels[document.category],
  ].some((value) => value.toLowerCase().includes(normalizedSearch))
}

export function DocumentLibrary({
  documents,
  onArchived,
}: DocumentLibraryProps) {
  const [searchValue, setSearchValue] = useState("")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<ClientDocument | null>(null)
  const { isFavorite, toggleFavorite } = useDocumentFavorites()

  const filteredDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          matchesSearch(document, searchValue) &&
          (!showFavoritesOnly || isFavorite(document.id)),
      ),
    [documents, isFavorite, searchValue, showFavoritesOnly],
  )

  const groupedDocuments = useMemo(
    () =>
      documentCategories
        .map((category) => ({
          category,
          documents: filteredDocuments.filter(
            (document) => document.category === category,
          ),
        }))
        .filter(
          (group): group is {
            category: DocumentCategory
            documents: ClientDocument[]
          } => group.documents.length > 0,
        ),
    [filteredDocuments],
  )

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <FileArchive className="mx-auto size-8 text-slate-400" />
        <h3 className="mt-3 font-semibold text-slate-900">No documents uploaded</h3>
        <p className="mt-1 text-sm text-slate-600">
          Use the upload area above to add the first document.
        </p>
      </div>
    )
  }

  return (
    <>
      <DocumentSearchBar
        onFavoritesChange={setShowFavoritesOnly}
        onSearchChange={setSearchValue}
        resultCount={filteredDocuments.length}
        searchValue={searchValue}
        showFavoritesOnly={showFavoritesOnly}
      />

      {filteredDocuments.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <SearchX className="mx-auto size-8 text-slate-400" />
          <h3 className="mt-3 font-semibold text-slate-900">No matching documents</h3>
          <p className="mt-1 text-sm text-slate-600">
            Clear the search or favorites filter to see more documents.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {groupedDocuments.map((group) => (
            <DocumentCategoryGroup
              category={group.category}
              documents={group.documents}
              isFavorite={isFavorite}
              key={group.category}
              onArchived={onArchived}
              onPreview={setPreviewDocument}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <DocumentPreviewModal
        document={previewDocument}
        onClose={() => setPreviewDocument(null)}
      />
    </>
  )
}
