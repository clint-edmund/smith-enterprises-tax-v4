import {
  CircleAlert,
  FileCheck2,
  FilePlus2,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react"

import {
  useState,
} from "react"

import {
  ReviewNotice,
} from "@/features/organizer-review/components/review-workspace/review-notice"

import {
  useEvidenceRegistry,
} from "@/features/organizer-review/hooks/use-evidence-registry"

import type {
  EvidenceConfidence,
  EvidenceFieldOption,
  EvidenceVerificationStatus,
} from "@/features/organizer-review/types/evidence.types"

interface EvidencePanelProps {
  organizerId: string
  sectionKey: string
  subjectType: string
  subjectId: string
  subjectLabel: string
  fieldOptions:
    EvidenceFieldOption[]
}

const evidenceTypeOptions = [
  {
    value:
      "birth_certificate",
    label:
      "Birth Certificate",
  },
  {
    value:
      "social_security_card",
    label:
      "Taxpayer Identification Document",
  },
  {
    value:
      "school_record",
    label:
      "School Record",
  },
  {
    value:
      "medical_record",
    label:
      "Medical or Disability Record",
  },
  {
    value:
      "prior_year_return",
    label:
      "Prior-Year Return",
  },
  {
    value:
      "organizer_answer",
    label:
      "Organizer Answer",
  },
  {
    value:
      "secure_message",
    label:
      "Secure Message",
  },
  {
    value:
      "phone_confirmation",
    label:
      "Phone Confirmation",
  },
  {
    value:
      "staff_observation",
    label:
      "Staff Observation",
  },
  {
    value:
      "other",
    label:
      "Other",
  },
] as const

const confidenceLabels:
  Record<
    EvidenceConfidence,
    string
  > = {
    high:
      "High",
    medium:
      "Medium",
    low:
      "Low",
    unverified:
      "Unverified",
  }

const statusLabels:
  Record<
    EvidenceVerificationStatus,
    string
  > = {
    unverified:
      "Unverified",
    under_review:
      "Under Review",
    verified:
      "Verified",
    rejected:
      "Rejected",
    needs_replacement:
      "Needs Replacement",
  }

function formatDateTime(
  value: string,
): string {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    },
  ).format(
    date,
  )
}

export function EvidencePanel({
  organizerId,
  sectionKey,
  subjectType,
  subjectId,
  subjectLabel,
  fieldOptions,
}: EvidencePanelProps) {
  const {
    evidence,
    isLoading,
    isSaving,
    savingEvidenceId,
    errorMessage,
    successMessage,
    refresh,
    createEvidence,
    verifyEvidence,
    clearMessages,
  } = useEvidenceRegistry({
    organizerId,
    sectionKey,
    subjectType,
    subjectId,
  })

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false)

  const [
    evidenceType,
    setEvidenceType,
  ] = useState(
    evidenceTypeOptions[0].value,
  )

  const [
    title,
    setTitle,
  ] = useState("")

  const [
    description,
    setDescription,
  ] = useState("")

  const [
    confidence,
    setConfidence,
  ] =
    useState<EvidenceConfidence>(
      "unverified",
    )

  const [
    fieldKey,
    setFieldKey,
  ] = useState(
    fieldOptions[0]?.key ??
      "",
  )

  async function handleCreate() {
    const didSave =
      await createEvidence({
        evidenceType,
        title,
        description,
        confidence,
        fieldKey:
          fieldKey ||
          null,
        linkType:
          "supports",
        linkNotes:
          `Evidence linked to ${subjectLabel}.`,
      })

    if (didSave) {
      setTitle("")
      setDescription("")
      setConfidence(
        "unverified",
      )
      setIsFormOpen(false)
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Evidence Workspace
          </p>

          <h4 className="mt-1 text-base font-semibold text-slate-950">
            Supporting Evidence
          </h4>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Register supporting information, link it to a reviewed field, and
            record staff verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            clearMessages()
            setIsFormOpen(
              (current) =>
                !current,
            )
          }}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <FilePlus2
            className="h-4 w-4"
            aria-hidden="true"
          />

          {isFormOpen
            ? "Close Form"
            : "Add Evidence"}
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        <p className="font-semibold">
          Initial evidence integration
        </p>

        <p className="mt-1 leading-6">
          This checkpoint registers manual evidence. Linking existing uploaded
          files will be enabled after the current document-storage table is
          confirmed.
        </p>
      </div>

      {isFormOpen && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Evidence Type
              </span>

              <select
                value={
                  evidenceType
                }
                onChange={(event) => {
                  setEvidenceType(
                    event.target.value as
                      typeof evidenceType,
                  )
                }}
                disabled={
                  isSaving
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                {evidenceTypeOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Supports Field
              </span>

              <select
                value={
                  fieldKey
                }
                onChange={(event) => {
                  setFieldKey(
                    event.target.value,
                  )
                }}
                disabled={
                  isSaving
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                {fieldOptions.map(
                  (option) => (
                    <option
                      key={
                        option.key
                      }
                      value={
                        option.key
                      }
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-800">
                Evidence Title
              </span>

              <input
                value={
                  title
                }
                onChange={(event) => {
                  setTitle(
                    event.target.value,
                  )
                }}
                disabled={
                  isSaving
                }
                placeholder="Example: Emily Smith birth certificate"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">
                Confidence
              </span>

              <select
                value={
                  confidence
                }
                onChange={(event) => {
                  setConfidence(
                    event.target
                      .value as
                      EvidenceConfidence,
                  )
                }}
                disabled={
                  isSaving
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value="unverified">
                  Unverified
                </option>
                <option value="high">
                  High
                </option>
                <option value="medium">
                  Medium
                </option>
                <option value="low">
                  Low
                </option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-800">
                Description
              </span>

              <textarea
                value={
                  description
                }
                onChange={(event) => {
                  setDescription(
                    event.target.value,
                  )
                }}
                disabled={
                  isSaving
                }
                rows={3}
                placeholder="Describe what this evidence supports. Do not enter sensitive identifier values."
                className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                void handleCreate()
              }}
              disabled={
                isSaving ||
                !title.trim()
              }
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving
                ? "Adding Evidence..."
                : "Add and Link Evidence"}
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <ReviewNotice
          tone="success"
          message={
            successMessage
          }
          onDismiss={
            clearMessages
          }
        />
      )}

      {errorMessage && (
        <>
          <ReviewNotice
            tone="error"
            message={
              errorMessage
            }
            onDismiss={
              clearMessages
            }
          />

          <button
            type="button"
            onClick={() => {
              void refresh()
            }}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-800"
          >
            Try Again
          </button>
        </>
      )}

      {isLoading ? (
        <div className="mt-5 space-y-3">
          {Array.from({
            length: 2,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl bg-slate-100"
              />
            ),
          )}
        </div>
      ) : evidence.length ===
        0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          No evidence has been linked to this dependent yet.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {evidence.map(
            (source) => {
              const isUpdating =
                savingEvidenceId ===
                source.evidenceId

              return (
                <article
                  key={
                    source.evidenceId
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCheck2
                          className="h-5 w-5 text-blue-700"
                          aria-hidden="true"
                        />

                        <h5 className="font-semibold text-slate-950">
                          {source.title}
                        </h5>
                      </div>

                      <p className="mt-1 text-sm text-slate-600">
                        {source.evidenceType.replaceAll(
                          "_",
                          " ",
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                        {
                          confidenceLabels[
                            source.confidence
                          ]
                        }{" "}
                        confidence
                      </span>

                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        {
                          statusLabels[
                            source
                              .verificationStatus
                          ]
                        }
                      </span>
                    </div>
                  </div>

                  {source.description && (
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {source.description}
                    </p>
                  )}

                  <div className="mt-3 rounded-lg bg-white p-3 text-xs text-slate-600">
                    <p>
                      Added by{" "}
                      <strong>
                        {source.createdByName}
                      </strong>{" "}
                      on{" "}
                      {formatDateTime(
                        source.createdAt,
                      )}
                    </p>

                    {source.verifiedAt && (
                      <p className="mt-1">
                        Verified by{" "}
                        <strong>
                          {source.verifiedByName ??
                            "Staff"}
                        </strong>{" "}
                        on{" "}
                        {formatDateTime(
                          source.verifiedAt,
                        )}
                      </p>
                    )}

                    <p className="mt-2 font-semibold text-slate-700">
                      Linked fields
                    </p>

                    <div className="mt-1 flex flex-wrap gap-2">
                      {source.links.map(
                        (link) => (
                          <span
                            key={
                              link.linkId
                            }
                            className="rounded-full bg-slate-100 px-2.5 py-1"
                          >
                            {fieldOptions.find(
                              (option) =>
                                option.key ===
                                link.fieldKey,
                            )?.label ??
                              link.fieldKey ??
                              "Review item"}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void verifyEvidence({
                          evidenceId:
                            source.evidenceId,
                          confidence:
                            source.confidence ===
                              "unverified"
                              ? "high"
                              : source.confidence,
                          verificationStatus:
                            "verified",
                          note:
                            "Evidence verified by staff.",
                        })
                      }}
                      disabled={
                        isUpdating ||
                        source.verificationStatus ===
                          "verified"
                      }
                      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 disabled:opacity-50"
                    >
                      <ShieldCheck
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Verify
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void verifyEvidence({
                          evidenceId:
                            source.evidenceId,
                          confidence:
                            source.confidence,
                          verificationStatus:
                            "under_review",
                          note:
                            "Evidence placed under review.",
                        })
                      }}
                      disabled={
                        isUpdating
                      }
                      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800 disabled:opacity-50"
                    >
                      <CircleAlert
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Under Review
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void verifyEvidence({
                          evidenceId:
                            source.evidenceId,
                          confidence:
                            source.confidence,
                          verificationStatus:
                            "needs_replacement",
                          note:
                            "A replacement evidence source is required.",
                        })
                      }}
                      disabled={
                        isUpdating
                      }
                      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-orange-300 bg-white px-3 py-2 text-xs font-semibold text-orange-800 disabled:opacity-50"
                    >
                      <RotateCcw
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Need Replacement
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void verifyEvidence({
                          evidenceId:
                            source.evidenceId,
                          confidence:
                            source.confidence,
                          verificationStatus:
                            "rejected",
                          note:
                            "Evidence rejected by staff.",
                        })
                      }}
                      disabled={
                        isUpdating
                      }
                      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-800 disabled:opacity-50"
                    >
                      <XCircle
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Reject
                    </button>
                  </div>

                  {isUpdating && (
                    <p className="mt-3 text-xs font-medium text-blue-700">
                      Updating evidence…
                    </p>
                  )}
                </article>
              )
            },
          )}
        </div>
      )}
    </section>
  )
}
