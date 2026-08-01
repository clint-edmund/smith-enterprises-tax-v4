import { supabase } from "@/services/supabase"

import type {
  PortalInvitationValidation,
} from "../types/portal-validation.types"

export async function validatePortalInvitation(
  tokenHash: string,
): Promise<PortalInvitationValidation> {
  const normalizedTokenHash =
    tokenHash.trim()

  if (!normalizedTokenHash) {
    throw new Error(
      "An invitation token is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "validate_client_portal_invitation",
    {
      requested_token_hash:
        normalizedTokenHash,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const validation =
    Array.isArray(data)
      ? data[0]
      : data

  if (!validation) {
    throw new Error(
      "The invitation is invalid or no longer available.",
    )
  }

  return {
    portalAccountId:
      validation.portal_account_id,

    clientId:
      validation.client_id,

    clientName:
      validation.client_name,

    email:
      validation.email,

    expiresAt:
      validation.expires_at,

    invitationStatus:
      validation.invitation_status,
  }
}