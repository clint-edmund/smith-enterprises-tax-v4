import type {
  OrganizerReviewDependent,
} from "@/features/organizer-review/types"

export function formatDependentReviewDate(
  value: string,
): string {
  const date =
    new Date(
      `${value}T00:00:00`,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
    },
  ).format(
    date,
  )
}

export function formatDependentReviewUpdatedAt(
  value: string,
): string {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    },
  ).format(
    date,
  )
}

export function getDependentFullName(
  dependent:
    OrganizerReviewDependent,
): string {
  return [
    dependent.firstName,
    dependent.middleName,
    dependent.lastName,
    dependent.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

export function dependentRequiresReview(
  dependent:
    OrganizerReviewDependent,
): boolean {
  return (
    dependent.claimedByAnotherTaxpayer ||
    !dependent.usCitizenOrResident ||
    (
      !dependent.livedWithTaxpayerAllYear &&
      dependent.monthsLivedWithTaxpayer <
        12
    )
  )
}
