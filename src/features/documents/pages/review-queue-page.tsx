import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  CalendarX,
  ClipboardCheck,
  Clock3,
  Loader2,
  RefreshCw,
} from "lucide-react"

import {
  useMemo,
  useState,
} from "react"

import {
  RequestChangesDialog,
} from "@/features/documents/components/review-queue/request-changes-dialog"

import {
  ReviewQueueTable,
} from "@/features/documents/components/review-queue/review-queue-table"

import {
  ReviewQueueToolbar,
} from "@/features/documents/components/review-queue/review-queue-toolbar"

import type {
  ReviewQueueFilter,
} from "@/features/documents/components/review-queue/review-queue-toolbar"

import {
  ReviewSummaryCard,
} from "@/features/documents/components/review-queue/review-summary-card"

import {
  useReviewQueue,
} from "@/features/documents/hooks/use-review-queue"

import {
  approveReview,
  requestChanges,
} from "@/features/documents/services/review-actions-service"

import { toast } from "sonner"

export function ReviewQueuePage() {
  const {
    queue,
    isLoading,
    error,
    refresh,
  } = useReviewQueue()

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("")

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<ReviewQueueFilter>("all")

  const [
    requestChangesDocument,
    setRequestChangesDocument,
  ] = useState<{
    id: string
    name: string
  } | null>(null)

  const [
    isSubmittingRequest,
    setIsSubmittingRequest,
  ] = useState(false)

  const [
    requestError,
    setRequestError,
  ] = useState<string | null>(null)

  const [
    activeAction,
    setActiveAction,
  ] = useState<{
    documentId: string
    action: "approve"
  } | null>(null)

  const [
    hiddenDocumentIds,
    setHiddenDocumentIds,
  ] = useState<string[]>([])

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase()

    return queue.items.filter((item) => {
      if (
        hiddenDocumentIds.includes(
          item.documentId,
        )
      ) {
        return false
      }

  // existing filtering logic...

      if (!normalizedSearch) {
        return true
      }

      const searchableValues = [
        item.clientName,
        item.clientNumber,
        item.originalFileName,
        item.taxYear?.toString(),
        item.returnType,
        item.reviewRequestedByName,
      ]

      return searchableValues.some((value) => {
        if (
          value === null ||
          value === undefined
        ) {
          return false
        }

        return String(value)
          .toLowerCase()
          .includes(normalizedSearch)
      })
    })
  }, [
    activeFilter,
    queue.items,
    searchTerm,
  ])

  const hasActiveFilters =
    activeFilter !== "all" ||
    searchTerm.trim().length > 0

  function clearFilters() {
    setSearchTerm("")
    setActiveFilter("all")
  }

  async function handleApprove(
    documentId: string,
  ) {
    try {
      setActiveAction({
        documentId,
        action: "approve",
      })

      setHiddenDocumentIds((current) => [
        ...current,
        documentId,
      ])

      await approveReview(documentId)
      await refresh()
      setHiddenDocumentIds([])
      toast.success(
        "Document approved successfully.",
      )
    } catch (approveError) {
      console.error(error)
      setHiddenDocumentIds((current) =>
      current.filter(
        (id) => id !== documentId,
      ),
    )

    toast.error(
      "Unable to approve document.",
    )
    } finally {
      setActiveAction(null)
    }
  }

  function handleRequestChanges(
    documentId: string,
  ) {
    const document = queue.items.find(
      (item) =>
        item.documentId === documentId,
    )

    if (!document) {
      return
    }

    setRequestError(null)
    setRequestChangesDocument({
      id: document.documentId,
      name: document.originalFileName,
    })
  }

  async function submitRequestChanges(
    comments: string,
  ) {
    if (!requestChangesDocument) {
      return
    }

    try {
      setIsSubmittingRequest(true)
      setRequestError(null)

      await requestChanges(
        requestChangesDocument.id,
        comments,
      )

      await refresh()
      setHiddenDocumentIds([])
      toast.success(
        "Review comments sent.",
      )
      setRequestChangesDocument(null)
    } catch (submitError) {
      console.error(error)

      toast.error(
        "Unable to send review comments.",
      )

      setRequestError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit review comments.",
      )
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <Loader2
            className="mx-auto h-8 w-8 animate-spin text-blue-600"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm text-slate-600">
            Loading your review queue...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <section className="space-y-6">
        <PageHeader />

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              aria-hidden="true"
            />

            <div>
              <h2 className="font-semibold text-red-900">
                Unable to load review queue
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => {
                  void refresh()
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <RefreshCw
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Try again
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <PageHeader />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <ReviewSummaryCard
          label="All Pending"
          value={queue.summary.total}
          icon={ClipboardCheck}
          isActive={activeFilter === "all"}
          onClick={() => {
            setActiveFilter("all")
          }}
        />

        <ReviewSummaryCard
          label="Overdue"
          value={queue.summary.overdue}
          icon={CalendarX}
          isActive={activeFilter === "overdue"}
          onClick={() => {
            setActiveFilter("overdue")
          }}
        />

        <ReviewSummaryCard
          label="Due Today"
          value={queue.summary.dueToday}
          icon={Clock3}
          isActive={activeFilter === "due_today"}
          onClick={() => {
            setActiveFilter("due_today")
          }}
        />

        <ReviewSummaryCard
          label="This Week"
          value={queue.summary.dueThisWeek}
          icon={CalendarDays}
          isActive={
            activeFilter === "due_this_week"
          }
          onClick={() => {
            setActiveFilter("due_this_week")
          }}
        />

        <ReviewSummaryCard
          label="Upcoming"
          value={queue.summary.upcoming}
          icon={CalendarClock}
          isActive={activeFilter === "upcoming"}
          onClick={() => {
            setActiveFilter("upcoming")
          }}
        />

        <ReviewSummaryCard
          label="No Due Date"
          value={queue.summary.noDueDate}
          icon={CalendarX}
          isActive={
            activeFilter === "no_due_date"
          }
          onClick={() => {
            setActiveFilter("no_due_date")
          }}
        />
      </div>

      <ReviewQueueToolbar
        searchTerm={searchTerm}
        activeFilter={activeFilter}
        resultCount={filteredItems.length}
        totalCount={queue.items.length}
        isRefreshing={false}
        onSearchChange={setSearchTerm}
        onFilterChange={setActiveFilter}
        onRefresh={() => {
          void refresh()
        }}
      />

      <ReviewQueueTable
        items={filteredItems}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onApprove={handleApprove}
        onRequestChanges={handleRequestChanges}
        activeAction={activeAction}
        isSubmittingRequest={
          isSubmittingRequest
        }
      />

      <RequestChangesDialog
        isOpen={
          requestChangesDocument !== null
        }
        documentName={
          requestChangesDocument?.name ?? null
        }
        isSubmitting={isSubmittingRequest}
        errorMessage={requestError}
        onClose={() => {
          if (!isSubmittingRequest) {
            setRequestChangesDocument(null)
            setRequestError(null)
          }
        }}
        onSubmit={submitRequestChanges}
      />
    </section>
  )
}

function PageHeader() {
  return (
    <header>
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        Document Workspace
      </p>

      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
        My Review Queue
      </h1>

      <p className="mt-2 max-w-3xl text-sm text-slate-600">
        Review documents assigned to you,
        prioritize approaching deadlines,
        and track outstanding work.
      </p>
    </header>
  )
}
