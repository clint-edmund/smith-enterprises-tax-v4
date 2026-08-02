import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getVaultSecretMetadata,
} from "./vault-service"

import type {
  VaultSecretMetadata,
  VaultSecretType,
} from "./vault.types"

interface UseVaultSecretOptions {
  organizerId: string

  secretType:
    VaultSecretType
}

interface UseVaultSecretResult {
  metadata:
    VaultSecretMetadata | null

  hasValue: boolean

  isLoading: boolean

  errorMessage:
    string | null

  refresh:
    () => Promise<void>

  setMetadata:
    (
      metadata:
        VaultSecretMetadata | null,
    ) => void
}

export function useVaultSecret({
  organizerId,
  secretType,
}: UseVaultSecretOptions):
  UseVaultSecretResult {
  const [
    metadata,
    setMetadata,
  ] =
    useState<VaultSecretMetadata | null>(
      null,
    )

  const [
    hasValue,
    setHasValue,
  ] = useState(false)

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  )

  const loadMetadata =
    useCallback(async () => {
      const normalizedOrganizerId =
        organizerId.trim()

      if (!normalizedOrganizerId) {
        setMetadata(null)
        setHasValue(false)
        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getVaultSecretMetadata({
            organizerId:
              normalizedOrganizerId,

            secretType,
          })

        setMetadata(
          result.secret,
        )

        setHasValue(
          result.hasValue,
        )
      } catch (error) {
        console.error(
          "Unable to load Secure Vault metadata:",
          error,
        )

        setMetadata(null)
        setHasValue(false)

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Secure-information metadata could not be loaded.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [
      organizerId,
      secretType,
    ])

  useEffect(() => {
    void loadMetadata()
  }, [loadMetadata])

  function updateMetadata(
    nextMetadata:
      VaultSecretMetadata | null,
  ) {
    setMetadata(
      nextMetadata,
    )

    setHasValue(
      nextMetadata !== null,
    )
  }

  return {
    metadata,
    hasValue,
    isLoading,
    errorMessage,
    refresh:
      loadMetadata,
    setMetadata:
      updateMetadata,
  }
}