import { FolderLock, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { DocumentLibrary } from "@/features/documents/components/document-library";
import { RequiredDocumentsPanel } from "@/features/documents/components/required-documents-panel";
import { DocumentUploadZone } from "@/features/documents/components/document-upload-zone";
import { listClientDocuments } from "@/features/documents/services/document-service";
import type { ClientDocument } from "@/features/documents/types/document.types";

interface DocumentWorkspaceProps {
  clientId: string;
  taxReturnId?: string | null;
  title?: string;
}

export function DocumentWorkspace({
  clientId,
  taxReturnId = null,
  title = "Documents",
}: DocumentWorkspaceProps) {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setDocuments(await listClientDocuments(clientId, taxReturnId));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Documents could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [clientId, taxReturnId]);

  useEffect(() => {
    void loadDocuments()
  }, [loadDocuments])

  function handleUploaded(document: ClientDocument) {
    setDocuments((current) => [
      document,
      ...current.filter((item) => item.id !== document.id),
    ]);
  }

  function handleArchived(documentId: string) {
    setDocuments((current) =>
      current.filter((document) => document.id !== documentId),
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
            <FolderLock className="size-5" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-950">{title}</h2>

            <p className="mt-1 text-sm text-slate-600">
              Upload, preview, search, organize, download, favorite, and archive
              secure client documents.
            </p>
          </div>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void loadDocuments()}
          type="button"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {taxReturnId ? (
        <div className="mt-5">
          <RequiredDocumentsPanel
            documents={documents}
            taxReturnId={taxReturnId}
          />
        </div>
      ) : null}

      <div className="mt-5">
        <DocumentUploadZone
          clientId={clientId}
          onUploaded={handleUploaded}
          taxReturnId={taxReturnId}
        />
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

      {!errorMessage && !isLoading ? (
        <div className="mt-5">
          <DocumentLibrary documents={documents} onArchived={handleArchived} />
        </div>
      ) : null}
    </section>
  );
}
