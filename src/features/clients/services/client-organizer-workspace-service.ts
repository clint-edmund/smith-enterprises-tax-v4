import {
  supabase,
} from "@/services/supabase"

import type {
  ClientOrganizerWorkspace,
  ClientOrganizerWorkspaceAssignment,
  ClientOrganizerWorkspaceOrganizer,
  ClientOrganizerWorkspaceReviewSummary,
  ClientOrganizerWorkspaceSection,
} from "@/features/clients/types/client-organizer-workspace.types"

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

function normalizedString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value
    : ""
}

function optionalString(
  value: unknown,
): string | null {
  return typeof value === "string"
    ? value
    : null
}

function requireBoolean(
  value: unknown,
  label: string,
): boolean {
  if (
    typeof value !== "boolean"
  ) {
    throw new Error(
      `${label} was not returned as a valid boolean.`,
    )
  }

  return value
}

function requireNumber(
  value: unknown,
  label: string,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error(
      `${label} was not returned as a valid number.`,
    )
  }

  return value
}

function requireInteger(
  value: unknown,
  label: string,
): number {
  const parsed =
    requireNumber(
      value,
      label,
    )

  if (
    !Number.isInteger(
      parsed,
    )
  ) {
    throw new Error(
      `${label} was not returned as a valid integer.`,
    )
  }

  return parsed
}

function requireArray(
  value: unknown,
  label: string,
): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `${label} was not returned as a valid list.`,
    )
  }

  return value
}

function mapOrganizer(
  value: unknown,
): ClientOrganizerWorkspaceOrganizer | null {
  if (value === null) {
    return null
  }

  const row =
    requireRecord(
      value,
      "Organizer",
    )

  return {
    organizerId:
      requireString(
        row.organizerId,
        "Organizer identifier",
      ),

    clientId:
      requireString(
        row.clientId,
        "Client identifier",
      ),

    taxYear:
      requireInteger(
        row.taxYear,
        "Organizer tax year",
      ),

    status:
      requireString(
        row.status,
        "Organizer status",
      ),

    currentSection:
      normalizedString(
        row.currentSection,
      ),

    progressPercentage:
      requireNumber(
        row.progressPercentage,
        "Organizer progress",
      ),

    startedAt:
      optionalString(
        row.startedAt,
      ),

    submittedAt:
      optionalString(
        row.submittedAt,
      ),

    lastSavedAt:
      optionalString(
        row.lastSavedAt,
      ),

    updatedAt:
      requireString(
        row.updatedAt,
        "Organizer updated timestamp",
      ),
  }
}

function mapAssignment(
  value: unknown,
): ClientOrganizerWorkspaceAssignment | null {
  if (value === null) {
    return null
  }

  const row =
    requireRecord(
      value,
      "Organizer assignment",
    )

  return {
    preparerId:
      optionalString(
        row.preparerId,
      ),

    preparerName:
      optionalString(
        row.preparerName,
      ),
  }
}

function mapReviewSummary(
  value: unknown,
): ClientOrganizerWorkspaceReviewSummary {
  const row =
    requireRecord(
      value,
      "Organizer review summary",
    )

  return {
    incomeSourceCount:
      requireInteger(
        row.incomeSourceCount,
        "Income source count",
      ),

    reviewedCount:
      requireInteger(
        row.reviewedCount,
        "Reviewed count",
      ),

    needsFollowUpCount:
      requireInteger(
        row.needsFollowUpCount,
        "Needs-follow-up count",
      ),

    returnedToClientCount:
      requireInteger(
        row.returnedToClientCount,
        "Returned-to-client count",
      ),

    pendingCount:
      requireInteger(
        row.pendingCount,
        "Pending count",
      ),

    reviewPercentage:
      requireInteger(
        row.reviewPercentage,
        "Review percentage",
      ),
  }
}

function mapSection(
  value: unknown,
): ClientOrganizerWorkspaceSection {
  const row =
    requireRecord(
      value,
      "Organizer review section",
    )

  return {
    key:
      requireString(
        row.key,
        "Section key",
      ),

    label:
      requireString(
        row.label,
        "Section label",
      ),

    status:
      requireString(
        row.status,
        "Section status",
      ) as ClientOrganizerWorkspaceSection["status"],

    isImplemented:
      requireBoolean(
        row.isImplemented,
        "Section implementation status",
      ),
  }
}

function mapWorkspace(
  value: unknown,
): ClientOrganizerWorkspace {
  const row =
    requireRecord(
      value,
      "Organizer workspace",
    )

  return {
    hasOrganizer:
      requireBoolean(
        row.hasOrganizer,
        "Organizer availability",
      ),

    organizer:
      mapOrganizer(
        row.organizer,
      ),

    assignment:
      mapAssignment(
        row.assignment,
      ),

    reviewSummary:
      mapReviewSummary(
        row.reviewSummary,
      ),

    sections:
      requireArray(
        row.sections,
        "Organizer review sections",
      ).map(
        mapSection,
      ),
  }
}

export async function getClientOrganizerWorkspace(
  clientId: string,
): Promise<ClientOrganizerWorkspace> {
  const normalizedClientId =
    clientId.trim()

  if (!normalizedClientId) {
    throw new Error(
      "A client identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await callRpc(
    "get_staff_client_organizer_workspace",
    {
      requested_client_id:
        normalizedClientId,
    },
  )

  if (error) {
    console.error(
      "Client Organizer Workspace RPC error:",
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

  return mapWorkspace(
    data,
  )
}
