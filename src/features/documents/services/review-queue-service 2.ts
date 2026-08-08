import type {
  DocumentReviewPriorityCode,
  DocumentReviewQueueData,
  DocumentReviewQueueItem,
  DocumentReviewQueueSummary,
} from "@/features/documents/types/review-queue.types"
import { supabase } from "@/services/supabase"

interface DocumentReviewQueueDatabaseRow {
  document_id: string
  client_id: string
  client_number: number | string
  client_name: string
  tax_return_id: string | null
  tax_year: number | null
  return_type: string | null
  original_file_name: string
  category: string
  review_status: "pending_review"
  review_requested_by: string | null
  review_requested_by_name: string | null
  review_requested_at: string | null
  assigned_reviewer_id: string
  assigned_reviewer_name: string | null
  review_due_at: string | null
  uploaded_by: string
  uploaded_by_name: string | null
  created_at: string
  priority_code: DocumentReviewPriorityCode
  days_until_due: number | null
}

type ReviewQueueRpc = (
  functionName: "list_my_assigned_document_reviews",
) => Promise<{
  data: unknown
  error: {
    message: string
  } | null
}>

const reviewQueueRpc =
  supabase.rpc.bind(supabase) as unknown as ReviewQueueRpc

function mapReviewQueueRow(
  row: DocumentReviewQueueDatabaseRow,
): DocumentReviewQueueItem {
  return {
    documentId: row.document_id,
    clientId: row.client_id,
    clientNumber: Number(row.client_number),
    clientName: row.client_name,
    taxReturnId: row.tax_return_id,
    taxYear: row.tax_year,
    returnType: row.return_type,
    originalFileName: row.original_file_name,
    category: row.category,
    reviewStatus: row.review_status,
    reviewRequestedBy: row.review_requested_by,
    reviewRequestedByName:
      row.review_requested_by_name,
    reviewRequestedAt: row.review_requested_at,
    assignedReviewerId: row.assigned_reviewer_id,
    assignedReviewerName:
      row.assigned_reviewer_name,
    reviewDueAt: row.review_due_at,
    uploadedBy: row.uploaded_by,
    uploadedByName: row.uploaded_by_name,
    createdAt: row.created_at,
    priorityCode: row.priority_code,
    daysUntilDue: row.days_until_due,
  }
}

function createEmptySummary():
DocumentReviewQueueSummary {
  return {
    total: 0,
    overdue: 0,
    dueToday: 0,
    dueThisWeek: 0,
    upcoming: 0,
    noDueDate: 0,
  }
}

function createQueueSummary(
  items: DocumentReviewQueueItem[],
): DocumentReviewQueueSummary {
  return items.reduce<DocumentReviewQueueSummary>(
    (summary, item) => {
      summary.total += 1

      switch (item.priorityCode) {
        case "overdue":
          summary.overdue += 1
          break

        case "due_today":
          summary.dueToday += 1
          break

        case "due_this_week":
          summary.dueThisWeek += 1
          break

        case "upcoming":
          summary.upcoming += 1
          break

        case "no_due_date":
          summary.noDueDate += 1
          break
      }

      return summary
    },
    createEmptySummary(),
  )
}

export async function listMyAssignedDocumentReviews():
Promise<DocumentReviewQueueData> {
  const { data, error } = await reviewQueueRpc(
    "list_my_assigned_document_reviews",
  )

  if (error) {
    throw new Error(error.message)
  }

  const items = (
    (data ?? []) as DocumentReviewQueueDatabaseRow[]
  ).map(mapReviewQueueRow)

  return {
    items,
    summary: createQueueSummary(items),
  }
}