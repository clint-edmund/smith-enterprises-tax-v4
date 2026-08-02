export type VaultSecretType =
  | "social_security_number"
  | "itin"
  | "drivers_license"
  | "passport"
  | "state_identification"
  | "routing_number"
  | "bank_account_number"
  | "identity_protection_pin"
  | "employer_identification_number"

export interface SaveVaultSecretRequest {
  organizerId?: string
  secretType: VaultSecretType
  plainTextValue: string
}

export interface SaveVaultSecretResponse {
  success: true
  vaultSecretId: string
  maskedValue: string
  keyVersion: number
  status: string
  replacedExistingSecret: boolean
  updatedAt: string
  requestId: string
}