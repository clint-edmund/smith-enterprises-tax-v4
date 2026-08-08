export type SensitiveFieldType =
  | "ssn"
  | "driver_license"
  | "routing_number"
  | "bank_account"
  | "ip_pin"

export type SensitiveDataStatus =
  | "missing"
  | "submitted"
  | "verified"
  | "rejected"

export type SensitiveAccessReason =
  | "tax_preparation"
  | "identity_verification"
  | "client_request"
  | "quality_review"
  | "administrator"

export interface SensitiveFieldSummary {
  fieldType: SensitiveFieldType

  status: SensitiveDataStatus

  lastUpdated: string | null

  verifiedAt: string | null

  verifiedBy: string | null

  maskedValue: string | null
}

export interface SensitiveFieldRevealRequest {
  clientId: string

  fieldType: SensitiveFieldType

  reason: SensitiveAccessReason
}

export interface SensitiveAuditEntry {
  id: string

  clientId: string

  fieldType: SensitiveFieldType

  action:
    | "created"
    | "updated"
    | "revealed"
    | "verified"

  performedBy: string

  performedAt: string

  reason: SensitiveAccessReason
}