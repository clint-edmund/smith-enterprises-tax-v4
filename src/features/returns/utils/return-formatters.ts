import type {
  FilingStatus,
  ReturnStatus,
  ReturnType,
  TaxFormType,
} from "@/features/returns/types/return.types"

const currencyFormatter =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  })

const dateFormatter =
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  })

const dateTimeFormatter =
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

const relativeDateFormatter =
  new Intl.RelativeTimeFormat("en-US", {
    numeric: "auto",
  })

export const returnTypeLabels:
  Record<ReturnType, string> = {
    individual: "Individual",
    business: "Business",
    amended: "Amended Return",
    extension: "Extension",
    other: "Other",
  }

export const taxFormLabels:
  Record<TaxFormType, string> = {
    "1040": "Form 1040",
    "1040_nr": "Form 1040-NR",
    "1041": "Form 1041",
    "1065": "Form 1065",
    "1120": "Form 1120",
    "1120_s": "Form 1120-S",
    "990": "Form 990",
    "schedule_c": "Schedule C",
    "state_only": "State Return Only",
    "other": "Other Form",
  }

export const filingStatusLabels:
  Record<FilingStatus, string> = {
    single: "Single",
    married_filing_jointly:
      "Married Filing Jointly",
    married_filing_separately:
      "Married Filing Separately",
    head_of_household:
      "Head of Household",
    qualifying_surviving_spouse:
      "Qualifying Surviving Spouse",
    not_applicable: "Not Applicable",
  }

export const returnStatusLabels:
  Record<ReturnStatus, string> = {
    not_started: "Intake",
    documents_pending: "Documents Pending",
    in_progress: "In Progress",
    ready_for_review: "Ready for Review",
    under_review: "Under Review",
    ready_to_file: "Ready to File",
    filed: "Filed",
    accepted: "Accepted",
    rejected: "Rejected",
    completed: "Completed",
    on_hold: "On Hold",
  }

export function formatReturnCurrency(
  value: number,
): string {
  return currencyFormatter.format(value)
}

export function formatReturnDate(
  value: string | null,
): string {
  if (!value) {
    return "Not provided"
  }

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return "Not provided"
  }

  return dateFormatter.format(date)
}

export function formatReturnClientName(
  firstName: string,
  lastName: string,
): string {
  return `${firstName} ${lastName}`
}

export function getReturnTitle(
  taxYear: number,
  taxForm: TaxFormType,
): string {
  return `${taxYear} ${taxFormLabels[taxForm]}`
}

export function formatReturnDateTime(
  value: string,
): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Unknown date"
  }

  return dateTimeFormatter.format(date)
}

export function formatReturnRelativeDate(
  value: string,
): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Unknown date"
  }

  const differenceMilliseconds =
    date.getTime() -
    Date.now()

  const differenceMinutes =
    Math.round(
      differenceMilliseconds /
        (1000 * 60),
    )

  if (
    Math.abs(differenceMinutes) <
    60
  ) {
    return relativeDateFormatter.format(
      differenceMinutes,
      "minute",
    )
  }

  const differenceHours =
    Math.round(
      differenceMinutes / 60,
    )

  if (
    Math.abs(differenceHours) <
    24
  ) {
    return relativeDateFormatter.format(
      differenceHours,
      "hour",
    )
  }

  const differenceDays =
    Math.round(
      differenceHours / 24,
    )

  if (
    Math.abs(differenceDays) <
    30
  ) {
    return relativeDateFormatter.format(
      differenceDays,
      "day",
    )
  }

  return formatReturnDateTime(value)
}

export function formatReturnActivityLabel(
  action: string,
): string {
  const labels: Record<string, string> = {
    tax_return_created:
      "Created the tax return",
    tax_return_updated:
      "Updated the tax return",
    return_status_updated:
      "Changed the workflow status",
    return_preparer_assigned:
      "Changed the assigned preparer",
    return_reviewer_assigned:
      "Changed the assigned reviewer",
    payment_created:
      "Recorded a payment",
    payment_voided:
      "Voided a payment",
  }

  return (
    labels[action] ??
    action
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase(),
      )
  )
}