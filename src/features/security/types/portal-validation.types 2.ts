export interface PortalInvitationValidation {
  portalAccountId: string

  clientId: string

  clientName: string

  email: string

  expiresAt: string

  invitationStatus:
    | "pending"
    | "accepted"
    | "expired"
    | "revoked"
}