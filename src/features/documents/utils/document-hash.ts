const SHA_256_ALGORITHM = "SHA-256"

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export async function calculateDocumentSha256(
  file: File,
): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "This browser does not support secure document fingerprinting.",
    )
  }

  const fileBuffer = await file.arrayBuffer()
  const hashBuffer = await globalThis.crypto.subtle.digest(
    SHA_256_ALGORITHM,
    fileBuffer,
  )

  return bytesToHex(new Uint8Array(hashBuffer))
}

export function isValidSha256Hash(value: string): boolean {
  return /^[0-9a-f]{64}$/.test(value)
}

export { SHA_256_ALGORITHM }
