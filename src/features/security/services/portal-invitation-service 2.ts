import { supabase } from "@/services/supabase"

import type {
  CreatePortalInvitationRequest,
  CreatePortalInvitationResult,
  PortalInvitation,
} from "../types/portal-invitation.types"

const DEFAULT_EXPIRATION_HOURS = 72

function bytesToBase64Url(
  bytes: Uint8Array,
): string {
  let binary = ""

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

async function hashToken(
  token: string,
): Promise<string> {
  const encodedToken =
    new TextEncoder().encode(token)

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      encodedToken,
    )

  return bytesToBase64Url(
    new Uint8Array(digest),
  )
}

function createRawToken(): string {
  const randomBytes =
    new Uint8Array(32)

  crypto.getRandomValues(randomBytes)

  return bytesToBase64Url(randomBytes)
}

function mapPortalInvitation(
  data: {
    id: string
    client_id: string
    email: string
    invitation_token_hash: string | null
    invitation_status:
      PortalInvitation["invitationStatus"]
    invitation_sent_at: string | null
    accepted_at: string | null
    invitation_expires_at: string | null
  },
): PortalInvitation {
  return {
    id: data.id,
    clientId: data.client_id,
    email: data.email,
    invitationTokenHash:
      data.invitation_token_hash,
    invitationStatus:
      data.invitation_status,
    invitationSentAt:
      data.invitation_sent_at,
    acceptedAt:
      data.accepted_at,
    expiresAt:
      data.invitation_expires_at,
  }
}

export async function createPortalInvitation(
  request: CreatePortalInvitationRequest,
): Promise<CreatePortalInvitationResult> {
  const normalizedClientId =
    request.clientId.trim()

  const normalizedEmail =
    request.email.trim().toLowerCase()

  const expiresInHours =
    request.expiresInHours ??
    DEFAULT_EXPIRATION_HOURS

  if (!normalizedClientId) {
    throw new Error(
      "A client identifier is required.",
    )
  }

  if (!normalizedEmail) {
    throw new Error(
      "A client email address is required.",
    )
  }

  if (
    !Number.isFinite(expiresInHours) ||
    expiresInHours <= 0
  ) {
    throw new Error(
      "The invitation expiration must be greater than zero hours.",
    )
  }

  const rawToken =
    createRawToken()

  const tokenHash =
    await hashToken(rawToken)

  const expirationDate =
    new Date(
      Date.now() +
        expiresInHours *
          60 *
          60 *
          1000,
    )

  const {
    data,
    error,
  } = await supabase.rpc(
    "create_client_portal_account",
    {
      requested_client_id:
        normalizedClientId,

      requested_email:
        normalizedEmail,

      requested_invitation_token_hash:
        tokenHash,

      requested_invitation_expires_at:
        expirationDate.toISOString(),
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error(
      "Supabase did not return the portal invitation.",
    )
  }

  const invitationData =
    Array.isArray(data)
      ? data[0]
      : data

  if (!invitationData) {
    throw new Error(
      "Supabase did not return the portal invitation.",
    )
  }

  return {
    invitation:
      mapPortalInvitation(
        invitationData,
      ),

    rawToken,
  }
}