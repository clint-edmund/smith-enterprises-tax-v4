function bytesToBase64Url(
  bytes: Uint8Array,
): string {
  let binary = ""

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

export async function hashPortalToken(
  rawToken: string,
): Promise<string> {
  const normalizedToken =
    rawToken.trim()

  if (!normalizedToken) {
    throw new Error(
      "An invitation token is required.",
    )
  }

  const encodedToken =
    new TextEncoder().encode(
      normalizedToken,
    )

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      encodedToken,
    )

  return bytesToBase64Url(
    new Uint8Array(digest),
  )
}
