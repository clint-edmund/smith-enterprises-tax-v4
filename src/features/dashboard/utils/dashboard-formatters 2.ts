const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const numberFormatter = new Intl.NumberFormat("en-US")

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatDate(value: string | null): string {
  if (!value) return "Not set"

  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : dateFormatter.format(date)
}

export function formatActivityDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : dateTimeFormatter.format(date)
}

export function formatReturnStatus(status: string): string {
  const labels: Record<string, string> = {
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
  }

  return labels[status] ?? status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function formatReturnType(returnType: string): string {
  return returnType
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function formatActivityLabel(action: string): string {
  const labels: Record<string, string> = {
    security_notice_accepted: "Accepted the security notice",
    staff_signed_in: "Signed in",
    staff_signed_out: "Signed out",
    client_created: "Created a client",
    client_updated: "Updated a client",
    tax_return_created: "Created a tax return",
    tax_return_updated: "Updated a tax return",
    tax_return_status_changed: "Changed a tax return status",
    payment_created: "Recorded a payment",
    payment_voided: "Voided a payment",
  }

  return labels[action] ?? action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
