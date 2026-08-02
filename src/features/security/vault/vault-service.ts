import {
  supabase,
} from "@/services/supabase"

import type {
  SaveVaultSecretRequest,
  SaveVaultSecretResponse,
} from "./vault.types"

export async function saveVaultSecret(
  request: SaveVaultSecretRequest,
): Promise<SaveVaultSecretResponse> {
  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "vault-save-secret",
    {
      body: request,
    },
  )

  if (error) {
    throw error
  }

  return data
}