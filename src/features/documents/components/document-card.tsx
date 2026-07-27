import {
  Archive,
  CheckCircle2,
  Download,
  Eye,
  FileCheck2,
  History,
  LoaderCircle,
  MessageSquareWarning,
  RotateCcw,
  Send,
  Star,
  UserRoundCheck,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

import { useAuth } from "@/features/auth/hooks/use-auth"
import {
  approveDocument,
  archiveClientDocument,
  createDocumentDownloadUrl,
  requestDocumentChanges,
  requestDocumentReview,
  resetDocumentReview,
} from "@/features/documents/services/document-service"
import type {
  ClientDocument,
  DocumentReviewStatus,
  DocumentReviewer,
} from "@/features/documents/types/document.types"
import {
  canPreviewDocument,
  documentCategoryLabels,
  formatDocumentSize,
} from "@/features/documents/utils/document-utils"

import {
  ReviewerAssignmentDialog,
} from "@/features/documents/components/reviewer-assignment-dialog"

import {
  assignDocumentReview,
} from "@/features/documents/services/document-service"

interface DocumentCardProps {
  document: ClientDocument
  isFavorite: boolean
  isSelected: boolean
  selectionDisabled?: boolean
  onArchived: (documentId: string) => void
  onPreview: (document: ClientDocument) => void
  onReviewChanged: () => void | Promise<void>
  onSelectionChange: (
    documentId: string,
    selected: boolean,
  ) => void
  onShowVersions: (document: ClientDocument) => void
  onToggleFavorite: (documentId: string) => void
}

type DocumentAction =
  | "download"
  | "archive"
  | "submit_review"
  | "approve"
  | "request_changes"
  | "reset_review"
  | "assign_reviewer"
  | null

const reviewStatusLabels: Record<DocumentReviewStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  needs_changes: "Needs Changes",
}

const reviewStatusClasses: Record<DocumentReviewStatus, string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  pending_review: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  needs_changes: "border-red-200 bg-red-50 text-red-800",
}

const submitterRoles = new Set([
  "administrator",
  "receptionist",
  "preparer",
  "tax_preparer",
])

const reviewerRoles = new Set([
  "administrator",
  "reviewer",
  "manager",
  "tax_manager",
  "senior_preparer",
])

export function DocumentCard({
  document,
  isFavorite,
  isSelected,
  selectionDisabled = false,
  onArchived,
  onPreview,
  onReviewChanged,
  onSelectionChange,
  onShowVersions,
  onToggleFavorite,
}: DocumentCardProps) {
  const { profile } = useAuth()
  const [action, setAction] = useState<DocumentAction>(null)
  const [
    isReviewerDialogOpen,
    setIsReviewerDialogOpen,
  ] = useState(false)

  const [
    reviewerAssignmentError,
    setReviewerAssignmentError,
  ] =
    useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isChangesDialogOpen, setIsChangesDialogOpen] = useState(false)
  const [changeComments, setChangeComments] = useState("")

  const currentRole = String(profile?.role ?? "").toLowerCase()

  const reviewerName = useMemo(() => {
  if (!profile) {
    return "Unknown reviewer"
  }

  return (
    profile.displayName?.trim() ||
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    profile.email
  )
}, [profile])

async function handleReviewerAssignment(
  request: {
    reviewer: DocumentReviewer
    dueAt: string | null
  }
  ) {
    setAction("assign_reviewer")
    setReviewerAssignmentError(null)

  try {
    await assignDocumentReview({
      documentId: document.id,
      reviewerId: request.reviewer.id,
      reviewDueAt: request.dueAt,
    })

    setIsReviewerDialogOpen(false)

    await onReviewChanged()
  } catch (error) {
    setReviewerAssignmentError(
      error instanceof Error
        ? error.message
        : "Unable to assign reviewer.",
    )
  } finally {
    setAction(null)
  }
}

  const canSubmitForReview =
    submitterRoles.has(currentRole) &&
    (
      document.reviewStatus === "draft" ||
      document.reviewStatus === "needs_changes"
    )

  const canAssignReviewer =
    submitterRoles.has(currentRole) &&
    document.reviewStatus === "pending_review"

  const canReview =
    reviewerRoles.has(currentRole) &&
    document.reviewStatus === "pending_review"

  const canResetReview =
    reviewerRoles.has(currentRole) &&
    document.reviewStatus !== "draft"

  const isBusy = action !== null

  async function runReviewAction(
    nextAction: Exclude<
      DocumentAction,
      "download" | "archive" | "assign_reviewer" |null
    >,
    operation: () => Promise<ClientDocument>,
  ) {
    setAction(nextAction)
    setErrorMessage(null)

    try {
      await operation()
      await onReviewChanged()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The review action could not be completed.",
      )
    } finally {
      setAction(null)
    }
  }

  async function handleDownload() {
    setAction("download")
    setErrorMessage(null)

    try {
      const url = await createDocumentDownloadUrl(document)

      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      )
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
    const confirmed = window.confirm(
      `Archive ${document.originalFileName}?`,
    )

    if (!confirmed) {
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

  async function handleSubmitForReview() {
    await runReviewAction(
      "submit_review",
      () => requestDocumentReview(document.id),
    )
  }

  async function handleApprove() {
    const confirmed = window.confirm(
      `Approve ${document.originalFileName}?`,
    )

    if (!confirmed) {
      return
    }

    await runReviewAction(
      "approve",
      () =>
        approveDocument(
          document.id,
          reviewerName,
        ),
    )
  }

  async function handleRequestChanges() {
    const comments = changeComments.trim()

    if (!comments) {
      setErrorMessage(
        "Enter review comments before requesting changes.",
      )
      return
    }

    await runReviewAction(
      "request_changes",
      () =>
        requestDocumentChanges(
          document.id,
          reviewerName,
          comments,
        ),
    )

    setChangeComments("")
    setIsChangesDialogOpen(false)
  }

  async function handleResetReview() {
    const confirmed = window.confirm(
      `Reset the review status for ${document.originalFileName}?`,
    )

    if (!confirmed) {
      return
    }

    await runReviewAction(
      "reset_review",
      () => resetDocumentReview(document.id),
    )
  }

  return (
    <>
      <article
        className={`rounded-xl border bg-white p-4 shadow-sm transition ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-100"
            : "border-slate-200 hover:border-slate-300 hover:shadow-md"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <label className="mt-1 flex shrink-0 items-center">
              <input
                aria-label={`Select ${document.originalFileName}`}
                checked={isSelected}
                className="size-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                disabled={selectionDisabled}
                onChange={(event) =>
                  onSelectionChange(
                    document.id,
                    event.target.checked,
                  )
                }
                type="checkbox"
              />
            </label>

            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <FileCheck2 className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">
                {document.originalFileName}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {documentCategoryLabels[document.category]}
                {" · "}
                {formatDocumentSize(document.sizeBytes)}
              </p>
            </div>
          </div>

          <button
            aria-label={
              isFavorite
                ? "Remove document from favorites"
                : "Add document to favorites"
            }
            className={`rounded-lg p-2 transition ${
              isFavorite
                ? "bg-amber-50 text-amber-600"
                : "text-slate-400 hover:bg-slate-100 hover:text-amber-600"
            }`}
            disabled={isBusy}
            onClick={() => onToggleFavorite(document.id)}
            type="button"
          >
            <Star
              className={`size-4 ${
                isFavorite ? "fill-current" : ""
              }`}
            />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
            {document.status.replace(/_/g, " ")}
          </span>

          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
            Version {document.versionNumber}
          </span>

          {document.isCurrentVersion ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Current version
            </span>
          ) : null}

          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
              reviewStatusClasses[document.reviewStatus]
            }`}
          >
            {reviewStatusLabels[document.reviewStatus]}
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
          Uploaded by {document.uploadedByName ?? "Unknown user"}
          {" · "}
          {new Date(document.createdAt).toLocaleString()}
        </p>

        {document.reviewComments ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <MessageSquareWarning className="size-4" />
              Reviewer Comments
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {document.reviewComments}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {document.reviewedByName
                ? `Reviewed by ${document.reviewedByName}`
                : "Reviewer not recorded"}
              {document.reviewedAt
                ? ` · ${new Date(
                    document.reviewedAt,
                  ).toLocaleString()}`
                : ""}
            </p>
          </div>
        ) : null}

        {document.reviewStatus === "pending_review" &&
        document.reviewRequestedAt ? (
          <p className="mt-3 text-xs font-medium text-amber-700">
            Submitted for review{" "}
            {new Date(
              document.reviewRequestedAt,
            ).toLocaleString()}
          </p>
        ) : null}

        {document.reviewStatus === "pending_review" &&
        document.assignedReviewerName ? (
          <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
              Assigned Reviewer
            </p>

            <p className="mt-1 text-sm font-semibold text-indigo-950">
              {document.assignedReviewerName}
            </p>

            {document.reviewDueAt ? (
              <p className="mt-1 text-xs text-indigo-700">
                Due{" "}
                {new Date(
                  document.reviewDueAt,
                ).toLocaleString()}
              </p>
            ) : null}
          </div>
        ) : null}

        {errorMessage ? (
          <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            disabled={isBusy}
            onClick={() => onPreview(document)}
            type="button"
          >
            <Eye className="size-4" />
            Preview
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={isBusy}
            onClick={() => onShowVersions(document)}
            type="button"
          >
            <History className="size-4" />
            Versions
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={isBusy}
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
            disabled={isBusy}
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

        {canSubmitForReview ||
        canAssignReviewer ||
        canReview ||
        canResetReview ? (
          <div className="mt-3 border-t border-slate-200 pt-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Review Actions
            </p>

            <div className="flex flex-wrap gap-2">
              {canSubmitForReview ? (
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                  disabled={isBusy}
                  onClick={() => void handleSubmitForReview()}
                  type="button"
                >
                  {action === "submit_review" ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Submit for Review
                </button>
              ) : null}

              {canAssignReviewer ? (
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                  disabled={isBusy}
                  onClick={() => {
                    setReviewerAssignmentError(null)
                    setIsReviewerDialogOpen(true)
                  }}
                  type="button"
                >
                  <UserRoundCheck className="size-4" />

                  {document.assignedReviewerId
                    ? "Change Reviewer"
                    : "Assign Reviewer"}
                </button>
              ) : null}

              {canReview ? (
                <>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                    disabled={isBusy}
                    onClick={() => void handleApprove()}
                    type="button"
                  >
                    {action === "approve" ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}

                    Approve
                  </button>

                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                    disabled={isBusy}
                    onClick={() => {
                      setErrorMessage(null)
                      setIsChangesDialogOpen(true)
                    }}
                    type="button"
                  >
                    <MessageSquareWarning className="size-4" />
                    Needs Changes
                  </button>
                </>
              ) : null}

              {canResetReview ? (
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  disabled={isBusy}
                  onClick={() => void handleResetReview()}
                  type="button"
                >
                  {action === "reset_review" ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="size-4" />
                  )}
                  Reset Review
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </article>

      {isChangesDialogOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Request Document Changes
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Explain what must be corrected for{" "}
                  <span className="font-semibold">
                    {document.originalFileName}
                  </span>
                  .
                </p>
              </div>

              <button
                aria-label="Close request changes dialog"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                disabled={isBusy}
                onClick={() => setIsChangesDialogOpen(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            <label
              className="mt-5 block"
              htmlFor="review-comments"
            >
              <span className="text-sm font-semibold text-slate-800">
                Reviewer comments
              </span>

              <textarea
                id="review-comments"
                name="reviewComments"
                className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={isBusy}
                onChange={(event) =>
                  setChangeComments(event.target.value)
                }
                placeholder="Describe the missing information or required correction."
                value={changeComments}
              />
            </label>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={isBusy}
                onClick={() => setIsChangesDialogOpen(false)}
                type="button"
              >
                Cancel
              </button>

              <button
                className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                disabled={isBusy || !changeComments.trim()}
                onClick={() => void handleRequestChanges()}
                type="button"
              >
                {action === "request_changes" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <MessageSquareWarning className="size-4" />
                )}
                Request Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ReviewerAssignmentDialog
        document={document}
        errorMessage={reviewerAssignmentError}
        isOpen={isReviewerDialogOpen}
        isSaving={action === "assign_reviewer"}
        onAssign={handleReviewerAssignment}
        onClose={() =>
          setIsReviewerDialogOpen(false)
        }
      />
    </>
  )
}
