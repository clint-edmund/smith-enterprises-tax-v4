import type {
  VaultSecretType,
} from "./types"

export function maskSecret(
  value: string,
  secretType: VaultSecretType,
): string {
  const trimmed =
    value.trim()

  switch (secretType) {
    case "social_security_number":
      return `***-**-${trimmed.slice(-4)}`

    case "bank_account_number":
      return `${"*".repeat(
        Math.max(
          0,
          trimmed.length - 4,
        ),
      )}${trimmed.slice(-4)}`

    case "routing_number":
      return `${"*".repeat(
        Math.max(
          0,
          trimmed.length - 3,
        ),
      )}${trimmed.slice(-3)}`

    case "drivers_license":
    case "passport":
    case "state_identification":
    case "identity_protection_pin":
    case "employer_identification_number":
    case "itin":
      return `${"*".repeat(
        Math.max(
          0,
          trimmed.length - 3,
        ),
      )}${trimmed.slice(-3)}`

    default:
      return "***"
  }
}