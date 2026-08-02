import type {
  VaultSecretType,
} from "./vault.types"

export interface VaultValidationResult {
  valid: boolean
  normalizedValue: string
  errorMessage?: string
}

function digitsOnly(
  value: string,
): string {
  return value.replace(
    /\D/g,
    "",
  )
}

export function normalizeVaultSecretValue(
  value: string,
  secretType: VaultSecretType,
): string {
  switch (secretType) {
    case "social_security_number":
    case "itin":
    case "routing_number":
    case "bank_account_number":
    case "identity_protection_pin":
    case "employer_identification_number":
      return digitsOnly(value)

    case "drivers_license":
    case "passport":
    case "state_identification":
      return value
        .trim()
        .replace(
          /\s+/g,
          " ",
        )
        .toUpperCase()

    default:
      return value.trim()
  }
}

function isInvalidSsn(
  value: string,
): boolean {
  const area =
    value.slice(0, 3)

  const group =
    value.slice(3, 5)

  const serial =
    value.slice(5, 9)

  return (
    area === "000" ||
    area === "666" ||
    Number(area) >= 900 ||
    group === "00" ||
    serial === "0000"
  )
}

function isValidItin(
  value: string,
): boolean {
  return /^9\d{2}(5\d|6[0-5]|7\d|8[0-8]|9[0-2]|9[4-9])\d{4}$/.test(
    value,
  )
}

export function validateVaultSecret(
  value: string,
  secretType: VaultSecretType,
): VaultValidationResult {
  const normalizedValue =
    normalizeVaultSecretValue(
      value,
      secretType,
    )

  if (!normalizedValue) {
    return {
      valid: false,
      normalizedValue,
      errorMessage:
        "A value is required.",
    }
  }

  switch (secretType) {
    case "social_security_number":
      if (
        !/^\d{9}$/.test(
          normalizedValue,
        )
      ) {
        return {
          valid: false,
          normalizedValue,
          errorMessage:
            "A Social Security number must contain exactly nine digits.",
        }
      }

      if (
        isInvalidSsn(
          normalizedValue,
        )
      ) {
        return {
          valid: false,
          normalizedValue,
          errorMessage:
            "Enter a valid Social Security number.",
        }
      }

      break

    case "itin":
      if (
        !isValidItin(
          normalizedValue,
        )
      ) {
        return {
          valid: false,
          normalizedValue,
          errorMessage:
            "Enter a valid nine-digit ITIN.",
        }
      }

      break

    case "routing_number":
      if (
        !/^\d{9}$/.test(
          normalizedValue,
        )
      ) {
        return {
          valid: false,
          normalizedValue,
          errorMessage:
            "A routing number must contain exactly nine digits.",
        }
      }

      break

    case "bank_account_number":
      if (
        !/^\d{4,17}$/.test(
          normalizedValue,
        )
      ) {
        return {
          valid: false,
          normalizedValue,
          errorMessage:
            "A bank account number must contain between 4 and 17 digits.",
        }
      }

      break

    case "identity_protection_pin":
      if (
        !/^\d{6}$/.test(
          normalizedValue,
        )
      ) {
        return {
          valid: false,
          normalizedValue,
          errorMessage:
            "An Identity Protection PIN must contain exactly six digits.",
        }
      }

      break

    case "employer_identification_number":
      if (
        !/^\d{9}$/.test(
          normalizedValue,
        )
      ) {
        return {
          valid: false,
          normalizedValue,
          errorMessage:
            "An employer identification number must contain exactly nine digits.",
        }
      }

      break

    case "drivers_license":
    case "state_identification":
      if (
        !/^[A-Z0-9][A-Z0-9 -]{2,31}$/.test(
          normalizedValue,
        )
      ) {
        return {
          valid: false,
          normalizedValue,
          errorMessage:
            "Enter a valid identification number using letters, numbers, spaces, or hyphens.",
        }
      }

      break

    case "passport":
      if (
        !/^[A-Z0-9]{5,20}$/.test(
          normalizedValue,
        )
      ) {
        return {
          valid: false,
          normalizedValue,
          errorMessage:
            "Enter a valid passport number using 5 to 20 letters or numbers.",
        }
      }

      break
  }

  return {
    valid: true,
    normalizedValue,
  }
}