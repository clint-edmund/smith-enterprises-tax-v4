import {
  ChevronDown,
  ChevronRight,
  Folder,
} from "lucide-react"
import { useState } from "react"

import {
  DocumentCard,
} from "@/features/documents/components/document-card"
import type {
  ClientDocument,
  DocumentCategory,
} from "@/features/documents/types/document.types"
import {
  documentCategoryLabels,
} from "@/features/documents/utils/document-utils"

interface DocumentCategoryGroupProps {
  category: DocumentCategory
  documents: ClientDocument[]
  isFavorite: (
    documentId: string,
  ) => boolean
  isSelected: (
    documentId: string,
  ) => boolean
  selectionDisabled?: boolean
  onArchived: (
    documentId: string,
  ) => void
  onPreview: (
    document: ClientDocument,
  ) => void
  onSelectionChange: (
    documentId: string,
    selected: boolean,
  ) => void
  onToggleFavorite: (
    documentId: string,
  ) => void
}

export function DocumentCategoryGroup({
  category,
  documents,
  isFavorite,
  isSelected,
  selectionDisabled = false,
  onArchived,
  onPreview,
  onSelectionChange,
  onToggleFavorite,
}: DocumentCategoryGroupProps) {
  const [
    isExpanded,
    setIsExpanded,
  ] = useState(true)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <button
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-100"
        onClick={() =>
          setIsExpanded(
            (current) => !current,
          )
        }
        type="button"
      >
        <span className="flex items-center gap-3">
          <span className="rounded-lg bg-white p-2 text-blue-700 shadow-sm">
            <Folder className="size-4" />
          </span>

          <span>
            <span className="block font-bold text-slate-950">
              {
                documentCategoryLabels[
                  category
                ]
              }
            </span>

            <span className="text-xs text-slate-500">
              {documents.length}{" "}
              {documents.length === 1
                ? "document"
                : "documents"}
            </span>
          </span>
        </span>

        {isExpanded ? (
          <ChevronDown className="size-5 text-slate-500" />
        ) : (
          <ChevronRight className="size-5 text-slate-500" />
        )}
      </button>

      {isExpanded ? (
        <div className="grid gap-4 border-t border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map(
            (document) => (
              <DocumentCard
                document={document}
                isFavorite={isFavorite(
                  document.id,
                )}
                isSelected={isSelected(
                  document.id,
                )}
                key={document.id}
                onArchived={
                  onArchived
                }
                onPreview={onPreview}
                onSelectionChange={
                  onSelectionChange
                }
                onToggleFavorite={
                  onToggleFavorite
                }
                selectionDisabled={
                  selectionDisabled
                }
              />
            ),
          )}
        </div>
      ) : null}
    </section>
  )
}