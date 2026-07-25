import {
  CheckCircle2,
  FileUp,
  LoaderCircle,
  SkipForward,
  Trash2,
  TriangleAlert,
  UploadCloud,
  XCircle,
} from "lucide-react"
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"

import { useDocumentUpload } from "@/features/documents/hooks/use-document-upload"
import type {
  ClientDocument,
  DocumentCategory,
} from "@/features/documents/types/document.types"
import {
  documentCategoryLabels,
  formatDocumentSize,
} from "@/features/documents/utils/document-utils"

interface DocumentUploadZoneProps {
  clientId: string
  taxReturnId?: string | null
  onUploaded: (document: ClientDocument) => void
}

export function DocumentUploadZone({
  clientId,
  taxReturnId = null,
  onUploaded,
}: DocumentUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [category, setCategory] =
    useState<DocumentCategory>("miscellaneous")
  const [description, setDescription] = useState("")

  const {
    items,
    isUploading,
    isCheckingDuplicates,
    addFiles,
    removeItem,
    keepDuplicate,
    skipDuplicate,
    clearCompleted,
    uploadQueued,
  } = useDocumentUpload({
    clientId,
    taxReturnId,
    category,
    description,
    onUploaded,
  })

  const queuedCount = items.filter(
    (item) => item.state === "queued",
  ).length
  const duplicateCount = items.filter(
    (item) => item.state === "duplicate",
  ).length
  const completedCount = items.filter(
    (item) =>
      item.state === "complete" ||
      item.state === "skipped",
  ).length
  const controlsDisabled =
    isUploading || isCheckingDuplicates

  function handleFiles(fileList: FileList | null) {
    if (fileList) {
      void addFiles(Array.from(fileList))
    }
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    handleFiles(event.target.files)
    event.target.value = ""
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)

    if (!controlsDisabled) {
      handleFiles(event.dataTransfer.files)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Document category
          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as DocumentCategory,
              )
            }
            disabled={controlsDisabled}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {Object.entries(documentCategoryLabels).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Description (optional)
          <input
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            disabled={controlsDisabled}
            placeholder="Example: 2025 W-2 from employer"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      <div
        onDragEnter={(event) => {
          event.preventDefault()

          if (!controlsDisabled) {
            setIsDragging(true)
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mt-4 rounded-xl border-2 border-dashed p-7 text-center transition ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-white hover:border-blue-400"
        }`}
      >
        <UploadCloud className="mx-auto size-9 text-blue-700" />

        <p className="mt-3 font-semibold text-slate-900">
          Drag documents here
        </p>

        <p className="mt-1 text-sm text-slate-600">
          or select one or more files from this computer
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={controlsDisabled}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {isCheckingDuplicates ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <FileUp className="size-4" />
          )}

          {isCheckingDuplicates
            ? "Checking Files..."
            : "Browse Files"}
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,.doc,.docx,.xls,.xlsx,.zip"
          onChange={handleInputChange}
          className="hidden"
        />

        <p className="mt-3 text-xs text-slate-500">
          PDF, JPG, PNG, HEIC, DOCX, XLSX, or ZIP ·
          25 MB maximum per file
        </p>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-2">
          {duplicateCount > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">
                {duplicateCount} exact duplicate
                {duplicateCount === 1 ? "" : "s"} detected
              </p>

              <p className="mt-1 text-xs text-amber-800">
                The SHA-256 fingerprint matches another document. Review each warning before uploading.
              </p>
            </div>
          ) : null}

          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border bg-white p-3 ${
                item.state === "duplicate"
                  ? "border-amber-300"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  {item.state === "hashing" ||
                  item.state === "checking" ||
                  item.state === "uploading" ? (
                    <LoaderCircle className="mt-0.5 size-5 shrink-0 animate-spin text-blue-700" />
                  ) : null}

                  {item.state === "complete" ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  ) : null}

                  {item.state === "error" ? (
                    <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                  ) : null}

                  {item.state === "duplicate" ? (
                    <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
                  ) : null}

                  {item.state === "skipped" ? (
                    <SkipForward className="mt-0.5 size-5 shrink-0 text-slate-500" />
                  ) : null}

                  {item.state === "queued" ? (
                    <FileUp className="mt-0.5 size-5 shrink-0 text-slate-500" />
                  ) : null}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.file.name}
                    </p>

                    <p className="mt-0.5 text-xs capitalize text-slate-500">
                      {formatDocumentSize(item.file.size)}
                      {" · "}
                      {item.state}
                    </p>

                    {item.errorMessage ? (
                      <p
                        className={`mt-1 text-xs ${
                          item.state === "duplicate"
                            ? "text-amber-800"
                            : "text-red-700"
                        }`}
                      >
                        {item.errorMessage}
                      </p>
                    ) : null}

                    {item.state === "duplicate" &&
                    item.duplicateDocuments.length > 0 ? (
                      <div className="mt-2 space-y-1 text-xs text-slate-600">
                        {item.duplicateDocuments.map(
                          (document) => (
                            <p key={document.id}>
                              Exact match:{" "}
                              <span className="font-semibold">
                                {document.originalFileName}
                              </span>
                              {" · "}
                              {new Date(
                                document.createdAt,
                              ).toLocaleDateString()}
                            </p>
                          ),
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                {!controlsDisabled &&
                item.state !== "complete" ? (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-red-700"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>

              {item.state === "duplicate" &&
              !controlsDisabled ? (
                <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-amber-200 pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      skipDuplicate(item.id)
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Skip
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      keepDuplicate(item.id)
                    }
                    className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    Keep Both
                  </button>
                </div>
              ) : null}
            </div>
          ))}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            {completedCount > 0 && !controlsDisabled ? (
              <button
                type="button"
                onClick={clearCompleted}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Clear Completed
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => void uploadQueued()}
              disabled={
                queuedCount === 0 ||
                controlsDisabled ||
                duplicateCount > 0
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <UploadCloud className="size-4" />
              )}

              Upload{" "}
              {queuedCount > 0
                ? `${queuedCount} File${
                    queuedCount === 1 ? "" : "s"
                  }`
                : "Files"}
            </button>
          </div>

          {duplicateCount > 0 ? (
            <p className="text-right text-xs text-amber-800">
              Resolve all exact duplicate warnings before uploading.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
