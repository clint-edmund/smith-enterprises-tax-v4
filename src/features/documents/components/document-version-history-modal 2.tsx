import {
  Download,
  FileUp,
  History,
  LoaderCircle,
  RotateCcw,
  X,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import {
  createDocumentDownloadUrl,
  listDocumentVersions,
  restoreDocumentVersion,
  uploadDocumentVersion,
} from "@/features/documents/services/document-service"
import type {
  ClientDocument,
} from "@/features/documents/types/document.types"
import {
  formatDocumentSize,
} from "@/features/documents/utils/document-utils"

interface DocumentVersionHistoryModalProps {
  document: ClientDocument | null
  onClose: () => void
  onVersionChanged: () => void | Promise<void>
}

type VersionAction =
  | "loading"
  | "uploading"
  | "restoring"
  | "downloading"
  | null

export function DocumentVersionHistoryModal({
  document,
  onClose,
  onVersionChanged,
}: DocumentVersionHistoryModalProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null)

  const [
    versions,
    setVersions,
  ] = useState<ClientDocument[]>([])

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null)

  const [
    versionNotes,
    setVersionNotes,
  ] = useState("")

  const [
    action,
    setAction,
  ] = useState<VersionAction>(null)

  const [
    activeDocumentId,
    setActiveDocumentId,
  ] = useState<string | null>(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null)

  const loadVersions =
    useCallback(async () => {
      if (!document) {
        setVersions([])
        return
      }

      setAction("loading")
      setErrorMessage(null)

      try {
        setVersions(
          await listDocumentVersions(
            document.id,
          ),
        )
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Version history could not be loaded.",
        )
      } finally {
        setAction(null)
      }
    }, [document])

  useEffect(() => {
    void loadVersions()
  }, [loadVersions])

  useEffect(() => {
    if (!document) {
      setSelectedFile(null)
      setVersionNotes("")
      setErrorMessage(null)
      setSuccessMessage(null)
      setActiveDocumentId(null)
    }
  }, [document])

  if (!document) {
    return null
  }

  const activeDocument = document

  async function handleUpload() {
    if (!selectedFile) {
      setErrorMessage(
        "Select a file before uploading a new version.",
      )
      return
    }

    setAction("uploading")
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const created =
        await uploadDocumentVersion({
          document: activeDocument,
          file: selectedFile,
          versionNotes,
        })

      setSelectedFile(null)
      setVersionNotes("")

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      setSuccessMessage(
        `Version ${created.versionNumber} was uploaded successfully.`,
      )

      await loadVersions()
      await onVersionChanged()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The new version could not be uploaded.",
      )
    } finally {
      setAction(null)
    }
  }

  async function handleRestore(
    version: ClientDocument,
  ) {
    const confirmed =
      window.confirm(
        `Restore version ${version.versionNumber} of ${version.originalFileName} as the current version?`,
      )

    if (!confirmed) {
      return
    }

    setAction("restoring")
    setActiveDocumentId(version.id)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const restored =
        await restoreDocumentVersion(
          version.id,
        )

      setSuccessMessage(
        `Version ${restored.versionNumber} is now the current version.`,
      )

      await loadVersions()
      await onVersionChanged()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The selected version could not be restored.",
      )
    } finally {
      setAction(null)
      setActiveDocumentId(null)
    }
  }

  async function handleDownload(
    version: ClientDocument,
  ) {
    setAction("downloading")
    setActiveDocumentId(version.id)
    setErrorMessage(null)

    try {
      const url =
        await createDocumentDownloadUrl(
          version,
        )

      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The selected version could not be opened.",
      )
    } finally {
      setAction(null)
      setActiveDocumentId(null)
    }
  }

  const isBusy = action !== null

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-violet-50 p-3 text-violet-700">
              <History className="size-5" />
            </span>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Version History
              </h2>

              <p className="mt-1 break-all text-sm text-slate-600">
                {document.originalFileName}
              </p>
            </div>
          </div>

          <button
            aria-label="Close version history"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            disabled={isBusy}
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-81px)] overflow-y-auto p-5 sm:p-6">
          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <FileUp className="size-5 text-blue-700" />

              <h3 className="font-bold text-slate-950">
                Upload New Version
              </h3>
            </div>

            <p className="mt-1 text-sm text-slate-600">
              The new file will become the current version while older versions remain available.
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-semibold text-slate-800"
                  htmlFor="document-version-file"
                >
                  Replacement file
                </label>

                <input
                  className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                  disabled={isBusy}
                  id="document-version-file"
                  onChange={(event) =>
                    setSelectedFile(
                      event.target.files?.[0] ??
                        null,
                    )
                  }
                  ref={fileInputRef}
                  type="file"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold text-slate-800"
                  htmlFor="document-version-notes"
                >
                  Version notes
                </label>

                <textarea
                  className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                  disabled={isBusy}
                  id="document-version-notes"
                  maxLength={500}
                  onChange={(event) =>
                    setVersionNotes(
                      event.target.value,
                    )
                  }
                  placeholder="Describe what changed in this version."
                  value={versionNotes}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  isBusy ||
                  !selectedFile
                }
                onClick={() =>
                  void handleUpload()
                }
                type="button"
              >
                {action === "uploading" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <FileUp className="size-4" />
                )}

                Upload New Version
              </button>
            </div>
          </section>

          {errorMessage ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          <section className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-950">
                Saved Versions
              </h3>

              <span className="text-sm text-slate-500">
                {versions.length}{" "}
                {versions.length === 1
                  ? "version"
                  : "versions"}
              </span>
            </div>

            {action === "loading" ? (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-600">
                <LoaderCircle className="size-5 animate-spin" />
                Loading version history…
              </div>
            ) : null}

            {action !== "loading" &&
            versions.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
                No versions were returned.
              </div>
            ) : null}

            {versions.length > 0 ? (
              <div className="mt-4 space-y-3">
                {versions.map((version) => {
                  const rowBusy =
                    activeDocumentId ===
                    version.id

                  return (
                    <article
                      className={`rounded-xl border p-4 ${
                        version.isCurrentVersion
                          ? "border-emerald-300 bg-emerald-50/50"
                          : "border-slate-200 bg-white"
                      }`}
                      key={version.id}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-950">
                              Version{" "}
                              {version.versionNumber}
                            </span>

                            {version.isCurrentVersion ? (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                                Current version
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                            {version.originalFileName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDocumentSize(
                              version.sizeBytes,
                            )}
                            {" · "}
                            Uploaded by{" "}
                            {version.uploadedByName ??
                              "Unknown user"}
                            {" · "}
                            {new Date(
                              version.createdAt,
                            ).toLocaleString()}
                          </p>

                          {version.versionNotes ? (
                            <p className="mt-3 rounded-lg bg-white/80 p-3 text-sm text-slate-700">
                              {version.versionNotes}
                            </p>
                          ) : (
                            <p className="mt-3 text-sm italic text-slate-500">
                              No version notes were provided.
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            disabled={isBusy}
                            onClick={() =>
                              void handleDownload(
                                version,
                              )
                            }
                            type="button"
                          >
                            {action ===
                              "downloading" &&
                            rowBusy ? (
                              <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                              <Download className="size-4" />
                            )}

                            Open
                          </button>

                          {!version.isCurrentVersion ? (
                            <button
                              className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
                              disabled={isBusy}
                              onClick={() =>
                                void handleRestore(
                                  version,
                                )
                              }
                              type="button"
                            >
                              {action ===
                                "restoring" &&
                              rowBusy ? (
                                <LoaderCircle className="size-4 animate-spin" />
                              ) : (
                                <RotateCcw className="size-4" />
                              )}

                              Restore
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
