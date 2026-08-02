import {
  supabase,
} from "@/services/supabase"

import type {
  GetVaultMetadataRequest,
  GetVaultMetadataResponse,
  SaveVaultSecretRequest,
  SaveVaultSecretResponse,
} from "./vault.types"

export async function saveVaultSecret(
  request:
    SaveVaultSecretRequest,
): Promise<SaveVaultSecretResponse> {
  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "vault-save-secret",
      {
        body: request,
      },
    )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (!data) {
    throw new Error(
      "The secure information could not be saved.",
    )
  }

  return data as
    SaveVaultSecretResponse
}

export async function getVaultSecretMetadata(
  request:
    GetVaultMetadataRequest,
): Promise<GetVaultMetadataResponse> {
  const normalizedOrganizerId =
    request.organizerId.trim()

  if (!normalizedOrganizerId) {
    throw new Error(
      "An organizer identifier is required.",
    )
  }

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "vault-get-metadata",
      {
        body: {
          organizerId:
            normalizedOrganizerId,

          secretType:
            request.secretType,
        },
      },
    )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (!data) {
    throw new Error(
      "Secure-information metadata could not be loaded.",
    )
  }

  return data as
    GetVaultMetadataResponse
}