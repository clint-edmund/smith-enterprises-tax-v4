import {
  useState,
} from "react"

import {
  saveVaultSecret,
} from "./vault-service"

import type {
  SaveVaultSecretRequest,
} from "./vault.types"

export function useVault() {
  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  )

  async function saveSecret(
    request:
      SaveVaultSecretRequest,
  ) {
    setIsSaving(true)
    setErrorMessage(null)

    try {
      return await saveVaultSecret(
        request,
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save secure information."

      setErrorMessage(message)

      throw error
    } finally {
      setIsSaving(false)
    }
  }

  return {
    saveSecret,
    isSaving,
    errorMessage,
  }
}