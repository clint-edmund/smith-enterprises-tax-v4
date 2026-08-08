import type {
  SaveOrganizerPersonalInformationRequest,
} from "@/features/client-portal/services/organizer-personal-information-service"

export interface OrganizerPersonalValidationErrors {
  legalFirstName?: string
  legalLastName?: string
  birthDate?: string
  filingStatus?: string
  occupation?: string

  email?: string
  mobilePhone?: string

  addressLine1?: string
  city?: string
  state?: string
  postalCode?: string

  addressChangedThisYear?: string
  maritalStatusChangedThisYear?: string
  employerChangedThisYear?: string
}

function isValidEmail(
  value: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim(),
  )
}

function countPhoneDigits(
  value: string,
): number {
  return value.replace(/\D/g, "").length
}

function isValidPostalCode(
  value: string,
): boolean {
  return /^\d{5}(?:-\d{4})?$/.test(
    value.trim(),
  )
}

export function validateOrganizerPersonalInformation(
  request: SaveOrganizerPersonalInformationRequest,
): OrganizerPersonalValidationErrors {
  const errors:
    OrganizerPersonalValidationErrors = {}

  if (!request.legalFirstName.trim()) {
    errors.legalFirstName =
      "Legal first name is required."
  }

  if (!request.legalLastName.trim()) {
    errors.legalLastName =
      "Legal last name is required."
  }

  if (!request.birthDate) {
    errors.birthDate =
      "Date of birth is required."
  }

  if (!request.filingStatus.trim()) {
    errors.filingStatus =
      "Filing status is required."
  }

  if (!request.occupation.trim()) {
    errors.occupation =
      "Occupation is required."
  }

  if (!request.email.trim()) {
    errors.email =
      "Email address is required."
  } else if (
    !isValidEmail(
      request.email,
    )
  ) {
    errors.email =
      "Enter a valid email address."
  }

  if (!request.mobilePhone.trim()) {
    errors.mobilePhone =
      "Mobile phone is required."
  } else if (
    countPhoneDigits(
      request.mobilePhone,
    ) !== 10
  ) {
    errors.mobilePhone =
      "Enter a complete 10-digit phone number."
  }

  if (!request.addressLine1.trim()) {
    errors.addressLine1 =
      "Street address is required."
  }

  if (!request.city.trim()) {
    errors.city =
      "City is required."
  }

  if (!request.state.trim()) {
    errors.state =
      "State is required."
  }

  if (!request.postalCode.trim()) {
    errors.postalCode =
      "ZIP code is required."
  } else if (
    !isValidPostalCode(
      request.postalCode,
    )
  ) {
    errors.postalCode =
      "Enter a valid 5-digit or ZIP+4 code."
  }

  if (
    request.addressChangedThisYear ===
    null
  ) {
    errors.addressChangedThisYear =
      "Select Yes or No."
  }

  if (
    request.maritalStatusChangedThisYear ===
    null
  ) {
    errors.maritalStatusChangedThisYear =
      "Select Yes or No."
  }

  if (
    request.employerChangedThisYear ===
    null
  ) {
    errors.employerChangedThisYear =
      "Select Yes or No."
  }

  return errors
}

export function hasOrganizerPersonalValidationErrors(
  errors:
    OrganizerPersonalValidationErrors,
): boolean {
  return Object.keys(errors).length > 0
}