import type {
  FilingStatus,
  ReturnStatus,
  ReturnType,
  TaxFormType,
} from "@/features/returns/types/return.types"
import {
  filingStatusLabels,
  returnStatusLabels,
  returnTypeLabels,
  taxFormLabels,
} from "@/features/returns/utils/return-formatters"

export interface SelectOption<TValue> {
  label: string
  value: TValue
}

function createOptions<
  TValue extends string,
>(
  labels: Record<TValue, string>,
): SelectOption<TValue>[] {
  return (
    Object.entries(labels) as [
      TValue,
      string,
    ][]
  ).map(([value, label]) => ({
    value,
    label,
  }))
}

export const returnTypeOptions =
  createOptions<ReturnType>(
    returnTypeLabels,
  )

export const taxFormOptions =
  createOptions<TaxFormType>(
    taxFormLabels,
  )

export const filingStatusOptions =
  createOptions<FilingStatus>(
    filingStatusLabels,
  )

export const returnStatusOptions =
  createOptions<ReturnStatus>(
    returnStatusLabels,
  )

export function getTaxYearOptions():
  number[] {
  const currentYear =
    new Date().getFullYear()

  const firstYear =
    currentYear + 1

  const lastYear =
    currentYear - 10

  const years: number[] = []

  for (
    let year = firstYear;
    year >= lastYear;
    year -= 1
  ) {
    years.push(year)
  }

  return years
}