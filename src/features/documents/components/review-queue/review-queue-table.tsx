import {
  FileSearch,
  Loader2,
  UserRound,
} from "lucide-react"

import {
  DueDateBadge,
} from "@/features/documents/components/review-queue/due-date-badge"

import {
  PriorityBadge,
} from "@/features/documents/components/review-queue/priority-badge"

import type {
  DocumentReviewQueueItem,
} from "@/features/documents/types/review-queue.types"

interface ReviewQueueTableProps {
  items: DocumentReviewQueueItem[]
  hasActiveFilters: boolean
  onClearFilters: () => void

  onApprove: (
    documentId: string,
  ) => Promise<void>

  onRequestChanges: (
    documentId: string,
  ) => void

  activeAction: {
    documentId: string
    action: "approve"
  } | null

  isSubmittingRequest: boolean
}

export function ReviewQueueTable({
  items,
  hasActiveFilters,
  onClearFilters,
  onApprove,
  onRequestChanges,
  activeAction,
  isSubmittingRequest,
}: ReviewQueueTableProps) {
  if (items.length === 0) {
    return (
      <ReviewQueueEmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <TableHeading>
                Client
              </TableHeading>

              <TableHeading>
                Return
              </TableHeading>

              <TableHeading>
                Document
              </TableHeading>

              <TableHeading>
                Requested By
              </TableHeading>

              <TableHeading>
                Due Date
              </TableHeading>

              <TableHeading>
                Priority
              </TableHeading>
              <TableHeading>
                Actions
              </TableHeading>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 bg-white">
            {items.map((item) => (
              <ReviewQueueRow
                key={item.documentId}
                item={item}
                onApprove={onApprove}
                onRequestChanges={onRequestChanges}
                activeAction={activeAction}
                isSubmittingRequest={isSubmittingRequest}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface ReviewQueueRowProps {
  item: DocumentReviewQueueItem

  onApprove: (
    documentId: string,
  ) => Promise<void>

  onRequestChanges: (
    documentId: string,
  ) => void

  activeAction: {
    documentId: string
    action: "approve"
  } | null

  isSubmittingRequest: boolean
}

function ReviewQueueRow({
  item,
  onApprove,
  onRequestChanges,
  activeAction,
  isSubmittingRequest,
}: ReviewQueueRowProps) {
  const returnDescription =
    createReturnDescription(item)
  const isApproving =
    activeAction?.documentId ===
      item.documentId &&
    activeAction.action === "approve"

  const disableActions =
    isApproving ||
    isSubmittingRequest

  return (
    <tr className="transition hover:bg-slate-50">
      <TableCell>
        <div className="min-w-44">
          <p className="font-semibold text-slate-950">
            {item.clientName}
          </p>

          {item.clientNumber ? (
            <p className="mt-1 text-xs text-slate-500">
              Client #{item.clientNumber}
            </p>
          ) : null}
        </div>
      </TableCell>

      <TableCell>
        <div className="min-w-32">
          <p className="text-sm font-medium text-slate-800">
            {returnDescription}
          </p>
        </div>
      </TableCell>

      <TableCell>
        <div className="min-w-56">
          <div className="flex items-start gap-2">
            <FileSearch
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p
                className="max-w-xs truncate text-sm font-medium text-slate-900"
                title={item.originalFileName}
              >
                {item.originalFileName}
              </p>
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex min-w-40 items-center gap-2">
          <UserRound
            className="h-4 w-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />

          <span className="text-sm text-slate-700">
            {item.reviewRequestedByName ??
              "Not available"}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="min-w-36">
          <DueDateBadge
            dueDate={item.reviewDueAt}
          />
        </div>
      </TableCell>

      <TableCell>
        <PriorityBadge
          priority={item.priorityCode}
        />
      </TableCell>
      <TableCell>
        <div className="flex min-w-max flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Open
          </button>

          <button
            type="button"
            disabled={disableActions}
            onClick={() => {
              void onApprove(item.documentId)
            }}
            className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isApproving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Approving...
              </span>
            ) : (
              "Approve"
            )}
          </button>

          <button
            type="button"
            disabled={disableActions}
            onClick={() => {
              onRequestChanges(item.documentId)
            }}
            className="rounded-md border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Needs Changes
          </button>
        </div>
      </TableCell>
    </tr>
  )
}

interface TableHeadingProps {
  children: React.ReactNode
}

function TableHeading({
  children,
}: TableHeadingProps) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
    >
      {children}
    </th>
  )
}

interface TableCellProps {
  children: React.ReactNode
}

function TableCell({
  children,
}: TableCellProps) {
  return (
    <td className="px-4 py-4 align-top">
      {children}
    </td>
  )
}

interface ReviewQueueEmptyStateProps {
  hasActiveFilters: boolean
  onClearFilters: () => void
}

function ReviewQueueEmptyState({
  hasActiveFilters,
  onClearFilters,
}: ReviewQueueEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <FileSearch
        className="mx-auto h-10 w-10 text-slate-400"
        aria-hidden="true"
      />

      <h2 className="mt-4 text-lg font-semibold text-slate-950">
        {hasActiveFilters
          ? "No matching reviews found"
          : "Your review queue is clear"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        {hasActiveFilters
          ? "No assigned documents match the current search and filter selections."
          : "You do not currently have any documents assigned for review."}
      </p>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  )
}

function createReturnDescription(
  item: DocumentReviewQueueItem,
): string {
  const parts = [
    item.taxYear?.toString(),
    item.returnType,
  ].filter(
    (
      value,
    ): value is string =>
      Boolean(value),
  )

  if (parts.length === 0) {
    return "Not linked"
  }

  return parts.join(" • ")
}