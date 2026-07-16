const currencyFormatter =
  new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  )

const numberFormatter =
  new Intl.NumberFormat("en-US")

const dateTimeFormatter =
  new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  )

export function formatCurrency(
  value: number,
): string {
  return currencyFormatter.format(value)
}

export function formatNumber(
  value: number,
): string {
  return numberFormatter.format(value)
}

export function formatActivityDate(
  value: string,
): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Unknown date"
  }

  return dateTimeFormatter.format(date)
}

export function formatActivityLabel(
  action: string,
): string {
  const labels: Record<string, string> = {
    security_notice_accepted:
      "Accepted the security notice",
    staff_signed_in:
      "Signed in",
    staff_signed_out:
      "Signed out",
    client_created:
      "Created a client",
    client_updated:
      "Updated a client",
    tax_return_created:
      "Created a tax return",
    tax_return_updated:
      "Updated a tax return",
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