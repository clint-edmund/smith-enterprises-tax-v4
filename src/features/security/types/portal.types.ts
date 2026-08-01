export type PortalInvitationStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "revoked"

export type PortalAccountStatus =
  | "inactive"
  | "active"
  | "locked"

export interface ClientPortalAccount {
  id: string

  clientId: string

  email: string

  status: PortalAccountStatus

  invitationStatus: PortalInvitationStatus

  lastSignInAt: string | null

  createdAt: string
}