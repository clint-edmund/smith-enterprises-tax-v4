import type {
  SupabaseClient,
} from "npm:@supabase/supabase-js@2"

import type {
  VaultSecretType,
} from "./types"

interface WriteVaultAuditEventOptions {
  serviceClient:
    SupabaseClient

  vaultSecretId?:
    string | null

  clientId?:
    string | null

  organizerId?:
    string | null

  secretType?:
    VaultSecretType | null

  actorUserId?:
    string | null

  action: string

  outcome:
    | "success"
    | "failure"
    | "denied"

  reason?: string | null

  source:
    | "client_portal"
    | "staff_portal"
    | "admin_portal"
    | "edge_function"
    | "system"
    | "migration"

  requestId: string

  request: Request

  metadata?: Record<
    string,
    unknown
  >
}

export async function writeVaultAuditEvent({
  serviceClient,
  vaultSecretId = null,
  clientId = null,
  organizerId = null,
  secretType = null,
  actorUserId = null,
  action,
  outcome,
  reason = null,
  source,
  requestId,
  request,
  metadata = {},
}: WriteVaultAuditEventOptions):
  Promise<void> {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for",
    )

  const ipAddress =
    forwardedFor
      ?.split(",")[0]
      ?.trim() ||
    null

  const userAgent =
    request.headers.get(
      "user-agent",
    )

  const sessionId =
    request.headers.get(
      "x-session-id",
    )

  const {
    error,
  } = await serviceClient.rpc(
    "write_vault_audit_event",
    {
      requested_vault_secret_id:
        vaultSecretId,

      requested_client_id:
        clientId,

      requested_organizer_id:
        organizerId,

      requested_secret_type:
        secretType,

      requested_actor_user_id:
        actorUserId,

      requested_action:
        action,

      requested_outcome:
        outcome,

      requested_reason:
        reason,

      requested_source:
        source,

      requested_request_id:
        requestId,

      requested_session_id:
        sessionId,

      requested_ip_address:
        ipAddress,

      requested_user_agent:
        userAgent,

      requested_metadata:
        metadata,
    },
  )

  if (error) {
    console.error(
      `Vault audit write failed. Request ID: ${requestId}`,
    )
  }
}