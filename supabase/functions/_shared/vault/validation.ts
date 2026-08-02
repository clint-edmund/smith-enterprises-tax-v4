import type {
  VaultSecretType,
} from "./types"

export function validateSecret(
  value: string,
  type: VaultSecretType,
): void {
  const trimmed =
    value.trim()

  if (trimmed.length === 0) {
    throw new Error(
      "A value is required.",
    )
  }

  switch (type) {
    case "social_security_number":
      if (!/^\d{9}$/.test(trimmed)) {
        throw new Error(
          "A Social Security Number must contain exactly 9 digits.",
        )
      }
      break

    case "routing_number":
      if (!/^\d{9}$/.test(trimmed)) {
        throw new Error(
          "A routing number must contain exactly 9 digits.",
        )
      }
      break

    default:
      break
  }
}