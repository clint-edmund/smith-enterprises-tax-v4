import {
  Download,
  ExternalLink,
  FileQuestion,
  LoaderCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { createDocumentDownloadUrl } from "@/features/documents/services/document-service";
import type { ClientDocument } from "@/features/documents/types/document.types";
import {
  canPreviewDocument,
  formatDocumentSize,
  isImageDocument,
  isPdfDocument,
} from "@/features/documents/utils/document-utils";

interface DocumentPreviewModalProps {
  document: ClientDocument | null;
  onClose: () => void;
}

export function DocumentPreviewModal({
  document,
  onClose,
}: DocumentPreviewModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!document) {
      return;
    }

    const selectedDocument = document;

    let isCancelled = false;

    async function loadPreview() {
      setIsLoading(true);
      setSignedUrl(null);
      setErrorMessage(null);

      try {
        const url = await createDocumentDownloadUrl(selectedDocument);

        if (!isCancelled) {
          setSignedUrl(url);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "The document preview could not be loaded.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPreview();

    return () => {
      isCancelled = true;
    };
  }, [document]);

  useEffect(() => {
    if (!document) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [document, onClose]);

  if (!document) {
    return null;
  }

  const previewSupported = canPreviewDocument(document);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      role="dialog"
    >
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-950">
              {document.originalFileName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {formatDocumentSize(document.sizeBytes)} · Uploaded by{" "}
              {document.uploadedByName}
            </p>
          </div>
          <button
            aria-label="Close document preview"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-[30rem] flex-1 overflow-auto bg-slate-100 p-4">
          {isLoading ? (
            <div className="flex h-full min-h-[30rem] items-center justify-center">
              <div className="text-center text-slate-600">
                <LoaderCircle className="mx-auto size-8 animate-spin" />
                <p className="mt-3 text-sm font-semibold">
                  Preparing secure preview…
                </p>
              </div>
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="mx-auto mt-16 max-w-lg rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-800">
              {errorMessage}
            </div>
          ) : null}

          {!isLoading && !errorMessage && signedUrl && previewSupported ? (
            <div className="flex min-h-[30rem] items-center justify-center">
              {isPdfDocument(document) ? (
                <iframe
                  className="h-[70vh] w-full rounded-lg border border-slate-300 bg-white"
                  src={signedUrl}
                  title={document.originalFileName}
                />
              ) : null}

              {isImageDocument(document) ? (
                <img
                  alt={document.originalFileName}
                  className="max-h-[70vh] max-w-full rounded-lg bg-white object-contain shadow"
                  src={signedUrl}
                />
              ) : null}
            </div>
          ) : null}

          {!isLoading && !errorMessage && signedUrl && !previewSupported ? (
            <div className="flex min-h-[30rem] items-center justify-center">
              <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <FileQuestion className="mx-auto size-10 text-slate-400" />
                <h3 className="mt-4 font-bold text-slate-950">
                  Preview is not available for this file type
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Download or open the document in a new browser tab to view it
                  with a compatible application.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4">
          {signedUrl ? (
            <>
              <a
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                href={signedUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-4" />
                Open in New Tab
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                download={document.originalFileName}
                href={signedUrl}
              >
                <Download className="size-4" />
                Download
              </a>
            </>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
