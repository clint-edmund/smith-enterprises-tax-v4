import type {
  PaymentMethod,
} from "../types/payment.types"

export const paymentMethodLabels:
  Record<PaymentMethod, string> = {
    cash: "Cash",
    check: "Check",
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    ach: "ACH",
    money_order: "Money Order",
    other: "Other",
  }

export function formatPaymentAmount(
  amount: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(amount)
}

export function formatPaymentDate(
  value: string | null,
): string {
  if (!value) {
    return "Not available"
  }

  const date = new Date(
    `${value.substring(0, 10)}T00:00:00`,
  )

  if (Number.isNaN(date.getTime())) {
    return "Not available"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date)
}