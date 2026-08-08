import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Sparkles,
  Link2,
  LoaderCircle,
  Minus,
  Plus,
  RotateCw,
  X,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  createEvidenceDocumentPreviewUrl,
} from "@/features/organizer-review/services/evidence-document-service"

import {
  analyzeDependentDocument,
} from "@/features/organizer-review/services/dependent-document-analysis-service"
import type {
  EvidenceConfidence,
  EvidenceFieldOption,
  OrganizerAvailableDocument,
} from "@/features/organizer-review/types/evidence.types"

import {
  DocumentAnalysisStatusPanel,
} from "@/features/organizer-review/components/document-analysis-status-panel"

interface DocumentReviewWorkspaceProps {
  document: OrganizerAvailableDocument | null
  subjectLabel: string
  fieldOptions: EvidenceFieldOption[]
  isSaving: boolean
  onClose: () => void
  onLinkFields: (
    fieldKeys: string[],
    evidenceType: string,
    confidence: EvidenceConfidence,
  ) => Promise<boolean>
}

const evidenceTypes = [
  ["birth_certificate", "Birth Certificate"],
  ["social_security_card", "Taxpayer Identification Document"],
  ["school_record", "School Record"],
  ["medical_record", "Medical or Disability Record"],
  ["prior_year_return", "Prior-Year Return"],
  ["other", "Other"],
] as const

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  return kb < 1024
    ? `${kb.toFixed(1)} KB`
    : `${(kb / 1024).toFixed(1)} MB`
}

function categoryLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function inferEvidenceType(
  document: OrganizerAvailableDocument,
): string {
  const value =
    `${document.category} ${document.originalFileName}`.toLowerCase()

  if (value.includes("birth")) return "birth_certificate"
  if (value.includes("social") || value.includes("ssn")) {
    return "social_security_card"
  }
  if (value.includes("school")) return "school_record"
  if (value.includes("medical") || value.includes("disability")) {
    return "medical_record"
  }
  if (value.includes("prior") || value.includes("return")) {
    return "prior_year_return"
  }
  return "other"
}

export function DocumentReviewWorkspace({
  document,
  subjectLabel,
  fieldOptions,
  isSaving,
  onClose,
  onLinkFields,
}: DocumentReviewWorkspaceProps) {
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null)
  const [previewError, setPreviewError] =
    useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] =
    useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [selectedFields, setSelectedFields] =
    useState<string[]>([])
  const [evidenceType, setEvidenceType] =
    useState("other")
  const [confidence, setConfidence] =
    useState<EvidenceConfidence>("unverified")

  const [
    suggestionsApplied,
    setSuggestionsApplied,
  ] = useState(false)

  useEffect(() => {
    if (!document) return

    const currentDocument =
      document

    setSelectedFields([])
    setEvidenceType(
      currentDocument.evidenceType ??
        inferEvidenceType(
          currentDocument,
        ),
    )
    setConfidence(
      currentDocument.evidenceConfidence ??
        "unverified",
    )
    setZoom(100)
    setRotation(0)
    setSuggestionsApplied(false)

    let active = true

    async function loadPreview() {
      try {
        setIsPreviewLoading(true)
        setPreviewError(null)

        const url =
          await createEvidenceDocumentPreviewUrl(
            currentDocument,
          )

        if (active) setPreviewUrl(url)
      } catch (error) {
        console.error(
          "Unable to load the document preview:",
          error,
        )

        if (active) {
          setPreviewUrl(null)
          setPreviewError(
            error instanceof Error
              ? error.message
              : "Unable to load the document preview.",
          )
        }
      } finally {
        if (active) setIsPreviewLoading(false)
      }
    }

    void loadPreview()

    return () => {
      active = false
    }
  }, [document])

  const isPdf =
    document?.mimeType === "application/pdf"
  const isImage =
    document?.mimeType.startsWith("image/") ??
    false

  const selectedLabels = useMemo(
    () =>
      selectedFields.map(
        (fieldKey) =>
          fieldOptions.find(
            (option) => option.key === fieldKey,
          )?.label ?? fieldKey,
      ),
    [fieldOptions, selectedFields],
  )


  const analysisSuggestion =
    useMemo(
      () =>
        document
          ? analyzeDependentDocument(
              document,
            )
          : null,
      [
        document,
      ],
    )

  const availableSuggestedFields =
    useMemo(
      () =>
        (
          analysisSuggestion
            ?.suggestedFields ??
          []
        ).filter(
          (suggestion) =>
            fieldOptions.some(
              (option) =>
                option.key ===
                suggestion.fieldKey,
            ),
        ),
      [
        analysisSuggestion,
        fieldOptions,
      ],
    )

  if (!document) return null

  function toggleField(fieldKey: string) {
    setSelectedFields((current) =>
      current.includes(fieldKey)
        ? current.filter((item) => item !== fieldKey)
        : [...current, fieldKey],
    )
  }

  function applyAnalysisSuggestions() {
    if (!analysisSuggestion) {
      return
    }

    setEvidenceType(
      analysisSuggestion.evidenceType,
    )

    setConfidence(
      analysisSuggestion.confidence,
    )

    setSelectedFields(
      availableSuggestedFields.map(
        (suggestion) =>
          suggestion.fieldKey,
      ),
    )

    setSuggestionsApplied(
      true,
    )
  }

  async function handleLink() {
    if (selectedFields.length === 0) return

    const didSave = await onLinkFields(
      selectedFields,
      evidenceType,
      confidence,
    )

    if (didSave) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-3"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-review-workspace-title"
        className="flex h-[94vh] w-full max-w-[95rem] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Document Review Workspace
            </p>

            <h2
              id="document-review-workspace-title"
              className="mt-1 truncate text-xl font-semibold text-slate-950"
            >
              {document.originalFileName}
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Review the source and link every field it supports for{" "}
              {subjectLabel}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">
              Close document review workspace
            </span>
          </button>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(24rem,0.8fr)]">
          <div className="flex min-h-0 flex-col bg-slate-900">
            <div className="flex flex-wrap items-center justify-end gap-2 border-b border-slate-700 px-4 py-3 text-white">
              {isImage && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setZoom((current) =>
                        Math.max(50, current - 25),
                      )
                    }
                    className="rounded-lg border border-slate-600 p-2 hover:bg-slate-800"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="min-w-14 text-center text-xs font-semibold">
                    {zoom}%
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setZoom((current) =>
                        Math.min(300, current + 25),
                      )
                    }
                    className="rounded-lg border border-slate-600 p-2 hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRotation(
                        (current) =>
                          (current + 90) % 360,
                      )
                    }
                    className="rounded-lg border border-slate-600 p-2 hover:bg-slate-800"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </>
              )}

              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold hover:bg-slate-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Original
                </a>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              {isPreviewLoading ? (
                <div className="flex h-full items-center justify-center text-white">
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  Loading secure preview…
                </div>
              ) : previewError ? (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-md rounded-xl border border-red-700 bg-red-950/40 p-5 text-center text-sm text-red-100">
                    {previewError}
                  </div>
                </div>
              ) : previewUrl && isPdf ? (
                <iframe
                  src={previewUrl}
                  title={document.originalFileName}
                  className="h-full min-h-[40rem] w-full rounded-lg bg-white"
                />
              ) : previewUrl && isImage ? (
                <div className="flex min-h-full items-center justify-center">
                  <img
                    src={previewUrl}
                    alt={document.originalFileName}
                    style={{
                      width: `${zoom}%`,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: "center",
                    }}
                    className="max-w-none rounded-lg shadow-xl transition-transform"
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 text-center text-slate-200">
                    <FileText className="mx-auto h-10 w-10" />
                    <p className="mt-3 font-semibold">
                      Preview unavailable
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Use Open Original to review this file type.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="min-h-0 overflow-y-auto bg-slate-50 p-5">
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-950">
                Document Metadata
              </h3>

              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </dt>
                  <dd className="mt-1">
                    {categoryLabel(document.category)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Uploaded
                  </dt>
                  <dd className="mt-1">
                    {formatDate(document.uploadedAt)} by{" "}
                    {document.uploadedByName}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    File
                  </dt>
                  <dd className="mt-1 break-words">
                    {document.mimeType} •{" "}
                    {formatFileSize(document.sizeBytes)}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Evidence Registry
                  </dt>
                  <dd className="mt-1">
                    {document.isRegisteredAsEvidence
                      ? "Existing source will be reused."
                      : "Not yet registered."}
                  </dd>
                </div>
              </dl>
            </section>

            <DocumentAnalysisStatusPanel
              documentId={
                document.documentId
              }
              organizerId={
                document.organizerId ??
                null
              }
              evidenceId={
                document.evidenceId
              }
            />

            <section className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-start gap-3">
                <Sparkles
                  className="mt-0.5 h-5 w-5 shrink-0 text-violet-700"
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-violet-950">
                    Guided Analysis
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-violet-900">
                    {analysisSuggestion?.explanation}
                  </p>

                  {availableSuggestedFields.length >
                    0 ? (
                    <>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-violet-800">
                        Suggested Fields
                      </p>

                      <ul className="mt-2 space-y-2">
                        {availableSuggestedFields.map(
                          (suggestion) => (
                            <li
                              key={
                                suggestion.fieldKey
                              }
                              className="rounded-lg bg-white/80 p-2.5 text-xs text-violet-950"
                            >
                              <p className="font-semibold">
                                {
                                  fieldOptions.find(
                                    (option) =>
                                      option.key ===
                                      suggestion.fieldKey,
                                  )?.label
                                }
                              </p>

                              <p className="mt-1 leading-5 text-violet-800">
                                {suggestion.reason}
                              </p>
                            </li>
                          ),
                        )}
                      </ul>

                      <button
                        type="button"
                        onClick={
                          applyAnalysisSuggestions
                        }
                        disabled={
                          isSaving
                        }
                        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:bg-slate-400"
                      >
                        {suggestionsApplied ? (
                          <CheckCircle2
                            className="h-4 w-4"
                          />
                        ) : (
                          <Sparkles
                            className="h-4 w-4"
                          />
                        )}

                        {suggestionsApplied
                          ? "Suggestions Applied"
                          : "Apply Suggestions"}
                      </button>
                    </>
                  ) : (
                    <p className="mt-3 rounded-lg bg-white/80 p-3 text-xs leading-5 text-violet-900">
                      No fields were selected automatically. Review the document and choose fields manually.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-950">
                Supported Fields
              </h3>

              <div className="mt-4 space-y-2">
                {fieldOptions.map((field) => {
                  const checked =
                    selectedFields.includes(field.key)

                  return (
                    <label
                      key={field.key}
                      className={[
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                        checked
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-300",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggleField(field.key)
                        }
                        disabled={isSaving}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700"
                      />

                      <span className="text-sm font-medium text-slate-900">
                        {field.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </section>

            <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-950">
                Evidence Classification
              </h3>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-800">
                  Evidence Type
                </span>

                <select
                  value={evidenceType}
                  onChange={(event) =>
                    setEvidenceType(event.target.value)
                  }
                  disabled={isSaving}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                >
                  {evidenceTypes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-slate-800">
                  Confidence
                </span>

                <select
                  value={confidence}
                  onChange={(event) =>
                    setConfidence(
                      event.target
                        .value as EvidenceConfidence,
                    )
                  }
                  disabled={isSaving}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="unverified">
                    Unverified
                  </option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>

              {selectedLabels.length > 0 && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  <p className="font-semibold">
                    Selected fields
                  </p>
                  <p className="mt-1 leading-5">
                    {selectedLabels.join(", ")}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleLink()}
                disabled={
                  isSaving ||
                  selectedFields.length === 0
                }
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                <Link2 className="h-4 w-4" />

                {isSaving
                  ? "Linking Document…"
                  : `Link to ${selectedFields.length} Field${
                      selectedFields.length === 1
                        ? ""
                        : "s"
                    }`}
              </button>
            </section>
          </aside>
        </div>
      </section>
    </div>
  )
}
