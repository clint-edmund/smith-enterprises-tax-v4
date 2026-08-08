import {
  supabase,
} from "@/services/supabase"

import type {
  MarkDependentReviewNeedsFollowUpRequest,
  ReturnDependentToClientRequest,
  SaveDependentReviewNotesRequest,
  StaffDependentReview,
  StaffDependentReviewStatus,
} from "@/features/organizer-review/types/staff-dependent-review.types"

interface StaffDependentReviewRow {
  review_id:
    string | null
  dependent_id: string
  review_status: string
  internal_notes: string
  reviewed_by:
    string | null
  reviewed_by_name:
    string | null
  reviewed_at:
    string | null
  follow_up_requested_at:
    string | null
  returned_to_client_at:
    string | null
  updated_at: string
}

type RpcResult =
  | StaffDependentReviewRow
  | StaffDependentReviewRow[]
  | null

function normalizeDependentId(
  value: string,
): string {
  const normalized =
    value.trim()

  if (!normalized) {
    throw new Error(
      "A dependent identifier is required.",
    )
  }

  return normalized
}

function normalizeRequiredNotes(
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

function normalizeOptionalNotes(
  value: string,
): string {
  const normalized =
    value.trim()

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

function getRpcRow(
  data: RpcResult,
): StaffDependentReviewRow {
  const row =
    Array.isArray(data)
      ? data[0]
      : data

  if (!row) {
    throw new Error(
      "The dependent review was not returned.",
    )
  }

  return row
}

function mapStatus(
  value: string,
): StaffDependentReviewStatus {
  switch (value) {
    case "pending":
    case "reviewed":
    case "needs_follow_up":
    case "returned_to_client":
      return value

    default:
      throw new Error(
        `Unsupported dependent review status: ${value}`,
      )
  }
}

function mapReview(
  row:
    StaffDependentReviewRow,
): StaffDependentReview {
  return {
    reviewId:
      row.review_id,

    dependentId:
      row.dependent_id,

    reviewStatus:
      mapStatus(
        row.review_status,
      ),

    internalNotes:
      row.internal_notes,

    reviewedBy:
      row.reviewed_by,

    reviewedByName:
      row.reviewed_by_name,

    reviewedAt:
      row.reviewed_at,

    followUpRequestedAt:
      row.follow_up_requested_at,

    returnedToClientAt:
      row.returned_to_client_at,

    updatedAt:
      row.updated_at,
  }
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message
  }

  return "Unable to complete the dependent review request."
}

export async function getStaffDependentReview(
  dependentId: string,
): Promise<StaffDependentReview> {
  const normalizedDependentId =
    normalizeDependentId(
      dependentId,
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_staff_dependent_review",
    {
      requested_dependent_id:
        normalizedDependentId,
    },
  )

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
      ),
    )
  }

  return mapReview(
    getRpcRow(
      data as RpcResult,
    ),
  )
}

export async function saveDependentReviewNotes(
  request:
    SaveDependentReviewNotesRequest,
): Promise<StaffDependentReview> {
  const dependentId =
    normalizeDependentId(
      request.dependentId,
    )

  const internalNotes =
    normalizeOptionalNotes(
      request.internalNotes,
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "save_dependent_review_notes",
    {
      requested_dependent_id:
        dependentId,

      requested_internal_notes:
        internalNotes,
    },
  )

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
      ),
    )
  }

  return mapReview(
    getRpcRow(
      data as RpcResult,
    ),
  )
}

export async function markDependentReviewComplete(
  dependentId: string,
): Promise<StaffDependentReview> {
  const normalizedDependentId =
    normalizeDependentId(
      dependentId,
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "mark_dependent_review_complete",
    {
      requested_dependent_id:
        normalizedDependentId,
    },
  )

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
      ),
    )
  }

  return mapReview(
    getRpcRow(
      data as RpcResult,
    ),
  )
}

export async function markDependentReviewNeedsFollowUp(
  request:
    MarkDependentReviewNeedsFollowUpRequest,
): Promise<StaffDependentReview> {
  const dependentId =
    normalizeDependentId(
      request.dependentId,
    )

  const internalNotes =
    normalizeRequiredNotes(
      request.internalNotes,
      "A follow-up note",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "mark_dependent_review_needs_followup",
    {
      requested_dependent_id:
        dependentId,

      requested_internal_notes:
        internalNotes,
    },
  )

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
      ),
    )
  }

  return mapReview(
    getRpcRow(
      data as RpcResult,
    ),
  )
}

export async function returnDependentToClient(
  request:
    ReturnDependentToClientRequest,
): Promise<StaffDependentReview> {
  const dependentId =
    normalizeDependentId(
      request.dependentId,
    )

  const internalNotes =
    normalizeRequiredNotes(
      request.internalNotes,
      "A return-to-client note",
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "return_dependent_to_client",
    {
      requested_dependent_id:
        dependentId,

      requested_internal_notes:
        internalNotes,
    },
  )

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
      ),
    )
  }

  return mapReview(
    getRpcRow(
      data as RpcResult,
    ),
  )
}
