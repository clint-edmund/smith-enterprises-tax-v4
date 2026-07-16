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
    not_started: "Not Started",
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