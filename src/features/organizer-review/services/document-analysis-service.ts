import {
  supabase,
} from "@/services/supabase"

import type {
  DocumentAnalysisJob,
  DocumentAnalysisStatus,
  QueueDocumentAnalysisRequest,
} from "@/features/organizer-review/types/document-analysis.types"

interface DocumentAnalysisJobRow {
  job_id: string
  document_id: string
  organizer_id: string | null
  evidence_id: string | null
  provider_key: string
  provider_name: string
  status: string
  requested_by: string | null
  requested_by_name: string
  requested_at: string
  queued_at: string | null
  processing_started_at: string | null
  completed_at: string | null
  failed_at: string | null
  attempt_count: number
  max_attempts: number
  failure_code: string | null
  failure_message: string | null
  result_id: string | null
  document_type: string | null
  overall_confidence: number | null
  requires_staff_review: boolean | null
  review_outcome: string | null
  reviewed_by_name: string | null
  reviewed_at: string | null
}

type AnalysisRpc = (
  functionName:
    | "queue_document_analysis_job"
    | "get_document_analysis_jobs",
  parameters?: Record<string, unknown>,
) => Promise<{
  data: unknown
  error:
    | {
        message: string
      }
    | null
}>

const analysisRpc =
  supabase.rpc.bind(
    supabase,
  ) as unknown as AnalysisRpc

function mapStatus(
  value: string,
): DocumentAnalysisStatus {
  switch (value) {
    case "pending":
    case "queued":
    case "processing":
    case "completed":
    case "review_required":
    case "failed":
    case "cancelled":
      return value

    default:
      throw new Error(
        `Unsupported document analysis status: ${value}`,
      )
  }
}

function mapJob(
  row:
    DocumentAnalysisJobRow,
): DocumentAnalysisJob {
  return {
    jobId:
      row.job_id,
    documentId:
      row.document_id,
    organizerId:
      row.organizer_id,
    evidenceId:
      row.evidence_id,
    providerKey:
      row.provider_key,
    providerName:
      row.provider_name,
    status:
      mapStatus(
        row.status,
      ),
    requestedBy:
      row.requested_by,
    requestedByName:
      row.requested_by_name,
    requestedAt:
      row.requested_at,
    queuedAt:
      row.queued_at,
    processingStartedAt:
      row.processing_started_at,
    completedAt:
      row.completed_at,
    failedAt:
      row.failed_at,
    attemptCount:
      row.attempt_count,
    maxAttempts:
      row.max_attempts,
    failureCode:
      row.failure_code,
    failureMessage:
      row.failure_message,
    resultId:
      row.result_id,
    documentType:
      row.document_type,
    overallConfidence:
      row.overall_confidence ===
        null
        ? null
        : Number(
            row.overall_confidence,
          ),
    requiresStaffReview:
      row.requires_staff_review,
    reviewOutcome:
      row.review_outcome,
    reviewedByName:
      row.reviewed_by_name,
    reviewedAt:
      row.reviewed_at,
  }
}

export async function queueDocumentAnalysis(
  request:
    QueueDocumentAnalysisRequest,
): Promise<string> {
  const {
    data,
    error,
  } = await analysisRpc(
    "queue_document_analysis_job",
    {
      requested_document_id:
        request.documentId,
      requested_organizer_id:
        request.organizerId ??
        null,
      requested_evidence_id:
        request.evidenceId ??
        null,
      requested_provider_key:
        request.providerKey ??
        "manual_test",
      requested_metadata:
        request.metadata ?? {},
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (
    typeof data !==
    "string"
  ) {
    throw new Error(
      "The queued analysis job identifier was not returned.",
    )
  }

  return data
}

export async function getDocumentAnalysisJobs(
  documentId: string,
): Promise<DocumentAnalysisJob[]> {
  const {
    data,
    error,
  } = await analysisRpc(
    "get_document_analysis_jobs",
    {
      requested_document_id:
        documentId,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  return (
    (
      data as
        | DocumentAnalysisJobRow[]
        | null
    ) ?? []
  ).map(
    mapJob,
  )
}
