import {
  FileArchive,
  FileCheck2,
  FolderLock,
  RefreshCw,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useState,
} from "react"

import { listClientDocuments } from "@/features/documents/services/document-service"
import type { ClientDocument } from "@/features/documents/types/document.types"
import {
  documentCategoryLabels,
  formatDocumentSize,
} from "@/features/documents/utils/document-utils"

interface DocumentWorkspaceProps {
  clientId: string
  taxReturnId?: string | null
  title?: string
}

export function DocumentWorkspace({
  clientId,
  taxReturnId = null,
  title = "Documents",
}: DocumentWorkspaceProps) {
  const [documents, setDocuments] = useState<ClientDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadDocuments = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const records = await listClientDocuments(
        clientId,
        taxReturnId,
      )
      setDocuments(records)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Documents could not be loaded.",
      )
    } finally {
      setIsLoading(false)
    }
  }, [clientId, taxReturnId])

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
            <FolderLock className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Secure client and tax-return document workspace.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadDocuments()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`size-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      ) : null}

      {!errorMessage && isLoading ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
          Loading documents…
        </div>
      ) : null}

      {!errorMessage && !isLoading && documents.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <FileArchive className="mx-auto size-8 text-slate-400" />
          <h3 className="mt-3 font-semibold text-slate-900">
            No documents uploaded
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Drag-and-drop upload controls will be connected in Phase 8.8 Sprint 2.
          </p>
        </div>
      ) : null}

      {!errorMessage && !isLoading && documents.length > 0 ? (
        <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
          {documents.map((document) => (
            <article
              key={document.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <FileCheck2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {document.originalFileName}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {documentCategoryLabels[document.category]}
                    {" · "}
                    {formatDocumentSize(document.sizeBytes)}
                    {" · Uploaded by "}
                    {document.uploadedByName}
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                {document.status}
              </span>
            </article>
          ))}
        </div>
      ) : null}

      <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        The storage bucket, metadata schema, access policies, signed-download support, and upload service are installed in this sprint. The upload interface arrives in Sprint 2.
      </div>
    </section>
  )
}
