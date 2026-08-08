import type {
  SaveOrganizerIdentityInformationRequest,
} from "@/features/client-portal/services/organizer-identity-information-service"

export interface OrganizerIdentityValidationErrors {
  identificationType?: string

  identificationState?: string

  identificationExpirationDate?: string

  citizenshipStatus?: string

  isUsCitizen?: string

  hasGovernmentPhotoId?: string

  hasIdentityChanged?: string
}

export function validateOrganizerIdentityInformation(
  request:
    SaveOrganizerIdentityInformationRequest,
): OrganizerIdentityValidationErrors {
  const errors:
    OrganizerIdentityValidationErrors = {}

  if (
    !request.identificationType.trim()
  ) {
    errors.identificationType =
      "Identification type is required."
  }

  if (
    !request.identificationState.trim()
  ) {
    errors.identificationState =
      "Issuing state is required."
  }

  if (
    !request.identificationExpirationDate
  ) {
    errors.identificationExpirationDate =
      "Expiration date is required."
  }

  if (
    !request.citizenshipStatus.trim()
  ) {
    errors.citizenshipStatus =
      "Citizenship status is required."
  }

  if (
    request.isUsCitizen ===
    null
  ) {
    errors.isUsCitizen =
      "Please answer this question."
  }

  if (
    request.hasGovernmentPhotoId ===
    null
  ) {
    errors.hasGovernmentPhotoId =
      "Please answer this question."
  }

  if (
    request.hasIdentityChanged ===
    null
  ) {
    errors.hasIdentityChanged =
      "Please answer this question."
  }

  return errors
}

export function hasOrganizerIdentityValidationErrors(
  errors:
    OrganizerIdentityValidationErrors,
): boolean {
  return (
    Object.keys(errors)
      .length > 0
  )
}