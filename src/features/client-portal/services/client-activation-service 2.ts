import { supabase } from "@/services/supabase"

import {
  hashPortalToken,
} from "@/features/security/utils/portal-token"

import type {
  ClientActivationRequest,
  ClientActivationResult,
} from "../types/client-activation.types"

export interface ClientActivationResponse {
  result: ClientActivationResult | null
  requiresEmailConfirmation: boolean
}

export async function activateClientPortalAccount(
  request: ClientActivationRequest,
): Promise<ClientActivationResponse> {
  const normalizedEmail =
    request.email.trim().toLowerCase()

  const normalizedToken =
    request.invitationToken.trim()

  if (!normalizedEmail) {
    throw new Error(
      "An email address is required.",
    )
  }

  if (!request.password) {
    throw new Error(
      "A password is required.",
    )
  }

  if (!normalizedToken) {
    throw new Error(
      "An invitation token is required.",
    )
  }

  const tokenHash =
    await hashPortalToken(
      normalizedToken,
    )

  const confirmationRedirect =
    new URL(
      "/client/register",
      window.location.origin,
    )

  confirmationRedirect.hash =
    encodeURIComponent(
      normalizedToken,
    )

  const {
    data: signUpData,
    error: signUpError,
  } = await supabase.auth.signUp({
    email:
      normalizedEmail,

    password:
      request.password,

    options: {
      emailRedirectTo:
        confirmationRedirect.toString(),
    },
  })

  if (signUpError) {
    throw new Error(
      signUpError.message,
    )
  }

  if (!signUpData.user) {
    throw new Error(
      "The client portal user could not be created.",
    )
  }

  if (!signUpData.session) {
    return {
      result: null,
      requiresEmailConfirmation:
        true,
    }
  }

  const {
    data: activationData,
    error: activationError,
  } = await supabase.rpc(
    "complete_client_portal_activation",
    {
      requested_token_hash:
        tokenHash,
    },
  )

  if (activationError) {
    throw new Error(
      activationError.message,
    )
  }

  const activation =
    Array.isArray(
      activationData,
    )
      ? activationData[0]
      : activationData

  if (!activation) {
    throw new Error(
      "The portal account could not be activated.",
    )
  }

  return {
    result: {
      portalProfileId:
        activation.portal_profile_id,

      clientId:
        activation.client_id,

      email:
        activation.email,

      activatedAt:
        activation.activated_at,
    },

    requiresEmailConfirmation:
      false,
  }
}