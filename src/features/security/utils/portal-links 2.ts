const DEFAULT_PORTAL_URL =
  import.meta.env.VITE_CLIENT_PORTAL_URL ??
  "http://localhost:5173"

export function buildPortalInvitationLink(
  rawToken: string,
): string {
  const normalizedToken =
    rawToken.trim()

  if (!normalizedToken) {
    throw new Error(
      "An invitation token is required.",
    )
  }

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

  invitationUrl.hash =
    encodeURIComponent(
      normalizedToken,
    )

  return invitationUrl.toString()
}