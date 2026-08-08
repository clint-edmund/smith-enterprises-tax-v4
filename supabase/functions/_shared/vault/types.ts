export type VaultSecretType =
  | "social_security_number"
  | "dependent_social_security_number"
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

  dependentId?: string

  secretType:
    VaultSecretType

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

export interface GetVaultMetadataRequest {
  organizerId?: string

  dependentId?: string

  secretType:
    VaultSecretType
}

export interface VaultSecretMetadata {
  vaultSecretId: string
  dependentId: string | null
  secretType: VaultSecretType
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
  secret: VaultSecretMetadata | null
  requestId: string
}
