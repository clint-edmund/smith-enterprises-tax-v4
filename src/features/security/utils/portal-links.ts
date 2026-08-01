const DEFAULT_PORTAL_URL =
  import.meta.env.VITE_CLIENT_PORTAL_URL ??
  "http://localhost:5174"

export function buildPortalInvitationLink(
  rawToken: string,
): string {
  const portalUrl =
    DEFAULT_PORTAL_URL.replace(
      /\/$/,
      "",
    )

  const invitationUrl =
    new URL(
      "/accept-invitation",
      portalUrl,
    )

  invitationUrl.searchParams.set(
    "token",
    rawToken,
  )

  return invitationUrl.toString()
}