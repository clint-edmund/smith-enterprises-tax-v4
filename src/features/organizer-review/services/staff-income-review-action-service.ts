import {
  supabase,
} from "@/services/supabase"

import type {
  MarkIncomeReviewCompleteRequest,
  MarkIncomeReviewNeedsFollowUpRequest,
  ReturnIncomeRecordToClientRequest,
  SaveIncomeReviewNotesRequest,
  StaffIncomeReviewActionResult,
} from "@/features/organizer-review/types"

interface RpcError {
  code?: string
  message: string
  details?: string
  hint?: string
}

interface RpcResponse {
  data: unknown
  error: RpcError | null
}

type RpcCaller = (
  functionName: string,
  argumentsValue: Record<
    string,
    unknown
  >,
) => Promise<RpcResponse>

const callRpc: RpcCaller = (
  functionName,
  argumentsValue,
) =>
  (
    supabase.rpc as unknown as
      RpcCaller
  ).call(
    supabase,
    functionName,
    argumentsValue,
  )

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  )
}

function requireRecord(
  value: unknown,
  label: string,
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(
      `${label} was not returned in the expected format.`,
    )
  }

  return value
}

function firstRow(
  data: unknown,
): Record<string, unknown> {
  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    throw new Error(
      "The Income review action did not return an updated record.",
    )
  }

  return requireRecord(
    data[0],
    "Income review action result",
  )
}

function requireString(
  value: unknown,
  label: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `${label} was not returned.`,
    )
  }

  return value
}

function optionalString(
  value: unknown,
): string | null {
  return typeof value === "string"
    ? value
    : null
}

function normalizedString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value
    : ""
}

function requireIdentifier(
  value: string,
  label: string,
): string {
  const normalized =
    value.trim()

  if (!normalized) {
    throw new Error(
      `${label} is required.`,
    )
  }

  return normalized
}

function normalizeNotes(
  value: string,
  options?: {
    required?: boolean
  },
): string {
  const normalized =
    value.trim()

  if (
    options?.required &&
    !normalized
  ) {
    throw new Error(
      "An internal note is required.",
    )
  }

  if (
    normalized.length >
    10000
  ) {
    throw new Error(
      "The internal note cannot exceed 10,000 characters.",
    )
  }

  return normalized
}

function mapActionResult(
  data: unknown,
): StaffIncomeReviewActionResult {
  const row =
    firstRow(data)

  return {
    reviewId:
      requireString(
        row.review_id,
        "Review identifier",
      ),

    incomeSourceId:
      requireString(
        row.income_source_id,
        "Income source identifier",
      ),

    reviewStatus:
      requireString(
        row.review_status,
        "Review status",
      ) as StaffIncomeReviewActionResult["reviewStatus"],

    internalNotes:
      normalizedString(
        row.internal_notes,
      ),

    reviewedBy:
      optionalString(
        row.reviewed_by,
      ),

    reviewedByName:
      optionalString(
        row.reviewed_by_name,
      ),

    reviewedAt:
      optionalString(
        row.reviewed_at,
      ),

    followUpRequestedAt:
      optionalString(
        row.follow_up_requested_at,
      ),

    returnedToClientAt:
      optionalString(
        row.returned_to_client_at,
      ),

    updatedAt:
      requireString(
        row.updated_at,
        "Review updated timestamp",
      ),
  }
}

async function executeAction(
  functionName: string,
  argumentsValue: Record<
    string,
    unknown
  >,
): Promise<StaffIncomeReviewActionResult> {
  const {
    data,
    error,
  } = await callRpc(
    functionName,
    argumentsValue,
  )

  if (error) {
    console.error(
      `${functionName} RPC error:`,
      {
        code:
          error.code,
        message:
          error.message,
        details:
          error.details,
        hint:
          error.hint,
      },
    )

    throw new Error(
      error.message,
    )
  }

  return mapActionResult(
    data,
  )
}

export async function markIncomeReviewComplete(
  request:
    MarkIncomeReviewCompleteRequest,
): Promise<StaffIncomeReviewActionResult> {
  return executeAction(
    "mark_income_review_complete",
    {
      requested_income_source_id:
        requireIdentifier(
          request.incomeSourceId,
          "An Income source identifier",
        ),
    },
  )
}

export async function markIncomeReviewNeedsFollowUp(
  request:
    MarkIncomeReviewNeedsFollowUpRequest,
): Promise<StaffIncomeReviewActionResult> {
  return executeAction(
    "mark_income_review_needs_followup",
    {
      requested_income_source_id:
        requireIdentifier(
          request.incomeSourceId,
          "An Income source identifier",
        ),

      requested_internal_notes:
        normalizeNotes(
          request.internalNotes,
          {
            required:
              true,
          },
        ),
    },
  )
}

export async function saveIncomeReviewNotes(
  request:
    SaveIncomeReviewNotesRequest,
): Promise<StaffIncomeReviewActionResult> {
  return executeAction(
    "save_income_review_notes",
    {
      requested_income_source_id:
        requireIdentifier(
          request.incomeSourceId,
          "An Income source identifier",
        ),

      requested_internal_notes:
        normalizeNotes(
          request.internalNotes,
        ),
    },
  )
}

export async function returnIncomeRecordToClient(
  request:
    ReturnIncomeRecordToClientRequest,
): Promise<StaffIncomeReviewActionResult> {
  return executeAction(
    "return_income_record_to_client",
    {
      requested_income_source_id:
        requireIdentifier(
          request.incomeSourceId,
          "An Income source identifier",
        ),

      requested_internal_notes:
        normalizeNotes(
          request.internalNotes,
          {
            required:
              true,
          },
        ),
    },
  )
}
