import type {
  TaxReturnFormValues,
} from "@/features/returns/types/return.types"

function normalizeValue(
  value:
    | string
    | number
    | boolean,
): string | number | boolean {
  if (typeof value === "string") {
    return value.trim()
  }

  return value
}

export function haveReturnValuesChanged(
  originalValues: TaxReturnFormValues,
  currentValues: TaxReturnFormValues,
): boolean {
  const keys =
    Object.keys(
      originalValues,
    ) as Array<
      keyof TaxReturnFormValues
    >

  return keys.some((key) => {
    return (
      normalizeValue(
        originalValues[key],
      ) !==
      normalizeValue(
        currentValues[key],
      )
    )
  })
}