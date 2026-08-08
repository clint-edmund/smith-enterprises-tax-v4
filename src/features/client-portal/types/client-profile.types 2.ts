export type ClientPortalStatus =
  | "invited"
  | "active"
  | "disabled"

export interface ClientProfile {
  id: string

  portalProfileId: string

  authUserId: string

  clientId: string

  clientNumber: number

  email: string

  firstName: string

  middleName: string | null

  lastName: string

  preferredName: string | null

  phone: string | null

  portalStatus: ClientPortalStatus

  invitedAt: string | null

  activatedAt: string | null

  lastLoginAt: string | null

  createdAt: string

  updatedAt: string
}

export interface ClientPortalSession {
  profile: ClientProfile

  isAuthenticated: boolean

  isLoading: boolean
}