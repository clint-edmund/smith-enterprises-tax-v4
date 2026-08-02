export interface VaultValidationResult {
  valid: boolean

  errorMessage?: string
}

export function validateVaultSecret(
  value: string,
): VaultValidationResult {
  const trimmedValue =
    value.trim()

  if (
    trimmedValue.length === 0
  ) {
    return {
      valid: false,
      errorMessage:
        "A value is required.",
    }
  }

  return {
    valid: true,
  }
}