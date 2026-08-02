const AES_GCM_IV_LENGTH =
  12

const AES_GCM_TAG_LENGTH =
  16

export interface EncryptedVaultValue {
  encryptedValue: string
  initializationVector: string
  authenticationTag: string
}

function decodeBase64(
  value: string,
): Uint8Array {
  try {
    const binary =
      atob(value)

    return Uint8Array.from(
      binary,
      (character) =>
        character.charCodeAt(0),
    )
  } catch {
    throw new Error(
      "The configured vault encryption key is invalid.",
    )
  }
}

function encodeHex(
  value: Uint8Array,
): string {
  return Array.from(value)
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
}

function toPostgresBytea(
  value: Uint8Array,
): string {
  return `\\x${encodeHex(value)}`
}

async function importEncryptionKey(
  keyVersion: number,
): Promise<CryptoKey> {
  const environmentVariable =
    `VAULT_ENCRYPTION_KEY_V${keyVersion}`

  const encodedKey =
    Deno.env.get(
      environmentVariable,
    )

  if (!encodedKey) {
    throw new Error(
      "The active vault encryption key is not configured.",
    )
  }

  const rawKey =
    decodeBase64(encodedKey)

  if (rawKey.byteLength !== 32) {
    throw new Error(
      "The vault encryption key must contain exactly 32 bytes.",
    )
  }

  return await crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "AES-GCM",
    },
    false,
    [
      "encrypt",
      "decrypt",
    ],
  )
}

export async function encryptVaultValue(
  plainTextValue: string,
  keyVersion: number,
): Promise<EncryptedVaultValue> {
  if (!plainTextValue) {
    throw new Error(
      "A secure value is required.",
    )
  }

  const key =
    await importEncryptionKey(
      keyVersion,
    )

  const initializationVector =
    crypto.getRandomValues(
      new Uint8Array(
        AES_GCM_IV_LENGTH,
      ),
    )

  const encodedPlainText =
    new TextEncoder().encode(
      plainTextValue,
    )

  const encryptedBuffer =
    await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: initializationVector,
        tagLength:
          AES_GCM_TAG_LENGTH * 8,
      },
      key,
      encodedPlainText,
    )

  const encryptedWithTag =
    new Uint8Array(
      encryptedBuffer,
    )

  if (
    encryptedWithTag.byteLength <=
    AES_GCM_TAG_LENGTH
  ) {
    throw new Error(
      "Secure encryption did not produce a valid result.",
    )
  }

  const encryptedValue =
    encryptedWithTag.slice(
      0,
      encryptedWithTag.byteLength -
        AES_GCM_TAG_LENGTH,
    )

  const authenticationTag =
    encryptedWithTag.slice(
      encryptedWithTag.byteLength -
        AES_GCM_TAG_LENGTH,
    )

  return {
    encryptedValue:
      toPostgresBytea(
        encryptedValue,
      ),

    initializationVector:
      toPostgresBytea(
        initializationVector,
      ),

    authenticationTag:
      toPostgresBytea(
        authenticationTag,
      ),
  }
}