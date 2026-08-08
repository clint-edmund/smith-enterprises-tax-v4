export interface ClientActivationRequest {
  email: string

  password: string

  invitationToken: string
}

export interface ClientActivationResult {
  portalProfileId: string

  clientId: string

  email: string

  activatedAt: string
}