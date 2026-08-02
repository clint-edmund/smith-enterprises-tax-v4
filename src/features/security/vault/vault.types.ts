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
  success: true

  vaultSecretId: string

  maskedValue: string

  keyVersion: number

  status:
    | "collected"
    | "pending_verification"
    | "verified"
    | "rejected"
    | "replaced"
    | "archived"

  replacedExistingSecret: boolean

  updatedAt: string

  requestId: string
}

export interface GetVaultMetadataRequest {
  organizerId: string

  secretType:
    VaultSecretType
}

export interface VaultSecretMetadata {
  vaultSecretId: string

  secretType:
    VaultSecretType

  maskedValue: string

  status:
    | "collected"
    | "pending_verification"
    | "verified"
    | "rejected"
    | "replaced"
    | "archived"

  keyVersion: number

  hasValue: true

  verified: boolean

  verifiedAt: string | null

  createdAt: string

  updatedAt: string
}

export interface GetVaultMetadataResponse {
  success: true

  hasValue: boolean

  secret:
    VaultSecretMetadata | null

  requestId: string
}