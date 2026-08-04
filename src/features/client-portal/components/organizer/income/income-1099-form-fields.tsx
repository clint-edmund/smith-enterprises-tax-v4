import {
  OrganizerTextField,
} from "@/features/client-portal/components/organizer/form"

export function toAmountInput(
  value: number | null,
): string {
  return value === null
    ? ""
    : String(value)
}

export function parseAmountInput(
  value: string,
): number | null {
  const normalized =
    value.trim()

  if (!normalized) {
    return null
  }

  return Number(normalized)
}

export function validateAmountInput(
  value: string,
  label: string,
): string | undefined {
  const normalized =
    value.trim()

  if (!normalized) {
    return undefined
  }

  const parsed =
    Number(normalized)

  if (!Number.isFinite(parsed)) {
    return `${label} must be a valid number.`
  }

  if (parsed < 0) {
    return `${label} cannot be negative.`
  }

  return undefined
}

interface AmountFieldProps {
  id: string
  label: string
  value: string
  error?: string
  disabled: boolean
  onChange: (value: string) => void
}

export function Income1099AmountField({
  id,
  label,
  value,
  error,
  disabled,
  onChange,
}: AmountFieldProps) {
  return (
    <OrganizerTextField
      id={id}
      label={label}
      value={value}
      error={error}
      disabled={disabled}
      inputMode="decimal"
      placeholder="0.00"
      onChange={(event) => {
        onChange(
          event.target.value,
        )
      }}
    />
  )
}
