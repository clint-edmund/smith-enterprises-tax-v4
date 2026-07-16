export function formatPhoneInput(
  value: string,
): string {
  const digits = value
    .replace(/\D/g, "")
    .slice(0, 10)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(
    3,
    6,
  )}-${digits.slice(6)}`
}

export function formatClientNumber(
  value: number,
): string {
  return `SE-${value.toString().padStart(6, "0")}`
}

export function formatClientName(
  client: {
    firstName: string
    middleName?: string | null
    lastName: string
    preferredName?: string | null
  },
): string {
  const legalName = [
    client.firstName,
    client.middleName,
    client.lastName,
  ]
    .filter(Boolean)
    .join(" ")

  if (
    client.preferredName &&
    client.preferredName !== client.firstName
  ) {
    return `${legalName} (${client.preferredName})`
  }

  return legalName
}

export function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Not provided"
  }

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return "Not provided"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
    },
  ).format(date)
}