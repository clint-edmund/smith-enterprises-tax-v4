import type {
  OrganizerValidationError,
} from "./organizer-types"

export function validateRequired(
  value: string | null | undefined,

  field: string,

  message: string,
): OrganizerValidationError[] {
  if (
    value &&
    value.trim().length > 0
  ) {
    return []
  }

  return [
    {
      field,
      message,
    },
  ]
}

export function validateMaximumLength(
  value: string,

  maxLength: number,

  field: string,

  message: string,
): OrganizerValidationError[] {
  if (
    value.length <=
    maxLength
  ) {
    return []
  }

  return [
    {
      field,
      message,
    },
  ]
}