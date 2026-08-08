export interface PortalInvitation {
  id: string
  clientId: string
  email: string
  invitationTokenHash: string | null
  invitationStatus:
    | "pending"
    | "accepted"
    | "expired"
    | "revoked"
  invitationSentAt: string | null
  acceptedAt: string | null
  expiresAt: string | null
}

export interface CreatePortalInvitationRequest {
  clientId: string
  email: string
  expiresInHours?: number
}

export interface CreatePortalInvitationResult {
  invitation: PortalInvitation
  rawToken: string
}