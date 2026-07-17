import {
  Archive,
  Download,
  Eye,
  FileCheck2,
  LoaderCircle,
  Star,
} from "lucide-react"
import { useState } from "react"

import {
  archiveClientDocument,
  createDocumentDownloadUrl,
} from "@/features/documents/services/document-service"
import type { ClientDocument } from "@/features/documents/types/document.types"
import {
  canPreviewDocument,
  documentCategoryLabels,
  formatDocumentSize,
} from "@/features/documents/utils/document-utils"

interface DocumentCardProps {
  document: ClientDocument
  isFavorite: boolean
  onArchived: (documentId: string) => void
  onPreview: (document: ClientDocument) => void
  onToggleFavorite: (documentId: string) => void
}

export function DocumentCard({
  document,
  isFavorite,
  onArchived,
  onPreview,
  onToggleFavorite,
}: DocumentCardProps) {
  const [action, setAction] = useState<"download" | "archive" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleDownload() {
    setAction("download")
    setErrorMessage(null)

    try {
      const url = await createDocumentDownloadUrl(document)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The document could not be opened.",
      )
    } finally {
      setAction(null)
    }
  }

  async function handleArchive() {
    if (!window.confirm(`Archive ${document.originalFileName}?`)) {
      return
    }

    setAction("archive")
    setErrorMessage(null)

    try {
      await archiveClientDocument(document.id)
      onArchived(document.id)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The document could not be archived.",
      )
    } finally {
      setAction(null)
    }
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
            <FileCheck2 className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-950">
              {document.originalFileName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {documentCategoryLabels[document.category]} · {formatDocumentSize(document.sizeBytes)}
            </p>
          </div>
        </div>

        <button
          aria-label={isFavorite ? "Remove document from favorites" : "Add document to favorites"}
          className={`rounded-lg p-2 transition ${
            isFavorite
              ? "bg-amber-50 text-amber-600"
              : "text-slate-400 hover:bg-slate-100 hover:text-amber-600"
          }`}
          onClick={() => onToggleFavorite(document.id)}
          type="button"
        >
          <Star className={`size-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
          {document.status}
        </span>
        {canPreviewDocument(document) ? (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Preview available
          </span>
        ) : null}
      </div>

      {document.description ? (
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">
          {document.description}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-slate-500">
        Uploaded by {document.uploadedByName} · {new Date(document.createdAt).toLocaleString()}
      </p>

      {errorMessage ? (
        <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          onClick={() => onPreview(document)}
          type="button"
        >
          <Eye className="size-4" />
          Preview
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={action !== null}
          onClick={() => void handleDownload()}
          type="button"
        >
          {action === "download" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-700 disabled:opacity-50"
          disabled={action !== null}
          onClick={() => void handleArchive()}
          type="button"
        >
          {action === "archive" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Archive className="size-4" />
          )}
          Archive
        </button>
      </div>
    </article>
  )
}
