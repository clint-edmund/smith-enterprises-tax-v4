import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileQuestion,
  LoaderCircle,
  Maximize2,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  RotateCw,
  X,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  createDocumentDownloadUrl,
} from "@/features/documents/services/document-service"
import type {
  ClientDocument,
} from "@/features/documents/types/document.types"
import {
  canPreviewDocument,
  documentCategoryLabels,
  formatDocumentSize,
  isImageDocument,
  isPdfDocument,
} from "@/features/documents/utils/document-utils"

interface DocumentPreviewModalProps {
  document: ClientDocument | null
  hasNext?: boolean
  hasPrevious?: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
}

type PdfViewMode =
  | "fit-page"
  | "fit-width"

const MIN_IMAGE_ZOOM = 25
const MAX_IMAGE_ZOOM = 300
const IMAGE_ZOOM_STEP = 25

function formatDocumentDate(
  value: string,
): string {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown"
  }

  return parsedDate.toLocaleString()
}

export function DocumentPreviewModal({
  document,
  hasNext = false,
  hasPrevious = false,
  onClose,
  onNext,
  onPrevious,
}: DocumentPreviewModalProps) {
  const [signedUrl, setSignedUrl] =
    useState<string | null>(null)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [isLoading, setIsLoading] =
    useState(false)

  const [imageZoom, setImageZoom] =
    useState(100)

  const [imageRotation, setImageRotation] =
    useState(0)

  const [pdfViewMode, setPdfViewMode] =
    useState<PdfViewMode>("fit-width")

  const resetViewer = useCallback(() => {
    setImageZoom(100)
    setImageRotation(0)
    setPdfViewMode("fit-width")
  }, [])

  useEffect(() => {
    if (!document) {
      setSignedUrl(null)
      setErrorMessage(null)

      return
    }

    const selectedDocument = document
    let isCancelled = false

    resetViewer()

    async function loadPreview() {
      setIsLoading(true)
      setSignedUrl(null)
      setErrorMessage(null)

      try {
        const url =
          await createDocumentDownloadUrl(
            selectedDocument,
          )

        if (!isCancelled) {
          setSignedUrl(url)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "The document preview could not be loaded.",
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadPreview()

    return () => {
      isCancelled = true
    }
  }, [document, resetViewer])

  useEffect(() => {
    if (!document) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClose()

        return
      }

      if (
        event.key === "ArrowLeft" &&
        hasPrevious
      ) {
        onPrevious?.()

        return
      }

      if (
        event.key === "ArrowRight" &&
        hasNext
      ) {
        onNext?.()
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      )
    }
  }, [
    document,
    hasNext,
    hasPrevious,
    onClose,
    onNext,
    onPrevious,
  ])

  const pdfPreviewUrl = useMemo(() => {
    if (
      !signedUrl ||
      !document ||
      !isPdfDocument(document)
    ) {
      return null
    }

    const viewParameter =
      pdfViewMode === "fit-page"
        ? "view=Fit"
        : "view=FitH"

    return `${signedUrl}#toolbar=1&navpanes=0&${viewParameter}`
  }, [
    document,
    pdfViewMode,
    signedUrl,
  ])

  if (!document) {
    return null
  }

  const previewSupported =
    canPreviewDocument(document)

  const isImage =
    isImageDocument(document)

  const isPdf =
    isPdfDocument(document)

  function handleZoomIn() {
    setImageZoom((current) =>
      Math.min(
        current + IMAGE_ZOOM_STEP,
        MAX_IMAGE_ZOOM,
      ),
    )
  }

  function handleZoomOut() {
    setImageZoom((current) =>
      Math.max(
        current - IMAGE_ZOOM_STEP,
        MIN_IMAGE_ZOOM,
      ),
    )
  }

  function handleRotateLeft() {
    setImageRotation(
      (current) => current - 90,
    )
  }

  function handleRotateRight() {
    setImageRotation(
      (current) => current + 90,
    )
  }

  function handleFitImage() {
    setImageZoom(100)
    setImageRotation(0)
  }

  function handlePrint() {
    if (!signedUrl) {
      return
    }

    const printWindow = window.open(
      signedUrl,
      "_blank",
      "noopener,noreferrer",
    )

    if (!printWindow) {
      setErrorMessage(
        "The browser blocked the print window. Allow pop-ups and try again.",
      )

      return
    }

    window.setTimeout(() => {
      try {
        printWindow.focus()
        printWindow.print()
      } catch {
        // Cross-origin PDF viewers may require
        // the user to select Print manually.
      }
    }, 750)
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 p-2 sm:p-4"
      role="dialog"
    >
      <div className="mx-auto flex h-full w-full max-w-[96rem] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Secure document preview
            </p>

            <h2 className="mt-1 truncate text-lg font-bold text-slate-950">
              {document.originalFileName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {formatDocumentSize(
                document.sizeBytes,
              )}
              {" · "}
              {documentCategoryLabels[
                document.category
              ]}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              aria-label="Previous document"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!hasPrevious}
              onClick={onPrevious}
              type="button"
            >
              <ChevronLeft className="size-5" />
            </button>

            <button
              aria-label="Next document"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!hasNext}
              onClick={onNext}
              type="button"
            >
              <ChevronRight className="size-5" />
            </button>

            <button
              aria-label="Close document preview"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              onClick={onClose}
              type="button"
            >
              <X className="size-5" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section className="flex min-h-[28rem] min-w-0 flex-1 flex-col bg-slate-200">
            <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-white px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                {isImage ? (
                  <>
                    <button
                      aria-label="Zoom out"
                      className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                      disabled={
                        imageZoom <=
                        MIN_IMAGE_ZOOM
                      }
                      onClick={handleZoomOut}
                      type="button"
                    >
                      <Minus className="size-4" />
                    </button>

                    <span className="min-w-16 text-center text-sm font-semibold text-slate-700">
                      {imageZoom}%
                    </span>

                    <button
                      aria-label="Zoom in"
                      className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                      disabled={
                        imageZoom >=
                        MAX_IMAGE_ZOOM
                      }
                      onClick={handleZoomIn}
                      type="button"
                    >
                      <Plus className="size-4" />
                    </button>

                    <button
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={handleFitImage}
                      type="button"
                    >
                      <Maximize2 className="size-4" />
                      Fit
                    </button>

                    <button
                      aria-label="Rotate left"
                      className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50"
                      onClick={handleRotateLeft}
                      type="button"
                    >
                      <RotateCcw className="size-4" />
                    </button>

                    <button
                      aria-label="Rotate right"
                      className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50"
                      onClick={handleRotateRight}
                      type="button"
                    >
                      <RotateCw className="size-4" />
                    </button>
                  </>
                ) : null}

                {isPdf ? (
                  <>
                    <button
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                        pdfViewMode ===
                        "fit-width"
                          ? "border-blue-700 bg-blue-50 text-blue-700"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() =>
                        setPdfViewMode(
                          "fit-width",
                        )
                      }
                      type="button"
                    >
                      Fit Width
                    </button>

                    <button
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                        pdfViewMode ===
                        "fit-page"
                          ? "border-blue-700 bg-blue-50 text-blue-700"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() =>
                        setPdfViewMode(
                          "fit-page",
                        )
                      }
                      type="button"
                    >
                      Fit Page
                    </button>
                  </>
                ) : null}
              </div>

              <p className="hidden text-xs text-slate-500 md:block">
                Use ← and → to move between
                documents
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
              {isLoading ? (
                <div className="flex h-full min-h-[28rem] items-center justify-center">
                  <div className="text-center text-slate-600">
                    <LoaderCircle className="mx-auto size-9 animate-spin" />

                    <p className="mt-3 text-sm font-semibold">
                      Preparing secure
                      preview…
                    </p>
                  </div>
                </div>
              ) : null}

              {!isLoading &&
              errorMessage ? (
                <div className="mx-auto mt-16 max-w-lg rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-800">
                  {errorMessage}
                </div>
              ) : null}

              {!isLoading &&
              !errorMessage &&
              signedUrl &&
              previewSupported ? (
                <div className="flex min-h-full items-center justify-center">
                  {isPdf &&
                  pdfPreviewUrl ? (
                    <iframe
                      className="h-full min-h-[70vh] w-full rounded-lg border border-slate-300 bg-white shadow-sm"
                      src={pdfPreviewUrl}
                      title={
                        document.originalFileName
                      }
                    />
                  ) : null}

                  {isImage ? (
                    <div className="flex min-h-[70vh] min-w-full items-center justify-center overflow-auto">
                      <img
                        alt={
                          document.originalFileName
                        }
                        className="max-w-none rounded-lg bg-white object-contain shadow-lg transition-transform duration-200"
                        src={signedUrl}
                        style={{
                          maxHeight:
                            imageZoom === 100
                              ? "70vh"
                              : "none",
                          transform: `rotate(${imageRotation}deg) scale(${
                            imageZoom / 100
                          })`,
                          transformOrigin:
                            "center center",
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!isLoading &&
              !errorMessage &&
              signedUrl &&
              !previewSupported ? (
                <div className="flex min-h-[28rem] items-center justify-center">
                  <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <FileQuestion className="mx-auto size-10 text-slate-400" />

                    <h3 className="mt-4 font-bold text-slate-950">
                      Preview is not
                      available
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                      Open or download this
                      document to view it in a
                      compatible application.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="w-full shrink-0 overflow-y-auto border-t border-slate-200 bg-white lg:w-80 lg:border-l lg:border-t-0">
            <div className="p-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Document information
              </h3>

              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    File name
                  </dt>

                  <dd className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {
                      document.originalFileName
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </dt>

                  <dd className="mt-1 text-sm text-slate-800">
                    {
                      documentCategoryLabels[
                        document.category
                      ]
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </dt>

                  <dd className="mt-1">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
                      {document.status}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    File size
                  </dt>

                  <dd className="mt-1 text-sm text-slate-800">
                    {formatDocumentSize(
                      document.sizeBytes,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    File type
                  </dt>

                  <dd className="mt-1 break-words text-sm text-slate-800">
                    {document.mimeType ||
                      "Unknown"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Uploaded by
                  </dt>

                  <dd className="mt-1 text-sm text-slate-800">
                    {
                      document.uploadedByName
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Uploaded
                  </dt>

                  <dd className="mt-1 text-sm text-slate-800">
                    {formatDocumentDate(
                      document.createdAt,
                    )}
                  </dd>
                </div>

                {document.description ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </dt>

                    <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                      {
                        document.description
                      }
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="border-t border-slate-200 p-5">
              <div className="grid gap-2">
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  disabled={!signedUrl}
                  onClick={handlePrint}
                  type="button"
                >
                  <Printer className="size-4" />
                  Print
                </button>

                {signedUrl ? (
                  <a
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    href={signedUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="size-4" />
                    Open in New Tab
                  </a>
                ) : null}

                {signedUrl ? (
                  <a
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                    download={
                      document.originalFileName
                    }
                    href={signedUrl}
                  >
                    <Download className="size-4" />
                    Download
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}