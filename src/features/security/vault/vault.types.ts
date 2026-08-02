export type VaultSecretType =
  | "social_security_number"
  | "itin"
  | "drivers_license"
  | "passport"
  | "state_identification"
  | "routing_number"
  | "bank_account_number"

export interface VaultRecord {
  id: string

  organizerId: string

  clientId: string

  secretType: VaultSecretType

  maskedValue: string

  hasValue: boolean

  verified: boolean

  keyVersion: number

  createdAt: string

  updatedAt: string
}

export interface SaveVaultSecretRequest {
  organizerId: string

  secretType: VaultSecretType

  plainTextValue: string
}

export interface SaveVaultSecretResponse {
  success: boolean

  maskedValue: string

  updatedAt: string
}