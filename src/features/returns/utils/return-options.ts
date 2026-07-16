import type {
  ReturnStatus,
} from "@/features/returns/types/return.types"
import {
  returnStatusLabels,
} from "@/features/returns/utils/return-formatters"

export interface SelectOption<TValue> {
  label: string
  value: TValue
}

export const returnStatusOptions:
  SelectOption<ReturnStatus>[] =
  (
    Object.entries(
      returnStatusLabels,
    ) as [
      ReturnStatus,
      string,
    ][]
  ).map(
    ([value, label]) => ({
      value,
      label,
    }),
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