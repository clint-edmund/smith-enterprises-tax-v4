import type {
  IncomeType,
} from "@/features/client-portal/types/organizer-income.types"

export interface IncomeTypeMetadata {
  type: IncomeType

  title: string

  shortTitle: string

  description: string
}

export const incomeTypeMetadata:
  readonly IncomeTypeMetadata[] =
[
  {
    type: "w2",
    title: "W-2 Employment",
    shortTitle: "W-2",
    description:
      "Income from an employer.",
  },

  {
    type: "1099_int",
    title: "Interest Income",
    shortTitle: "1099-INT",
    description:
      "Interest from banks and financial institutions.",
  },

  {
    type: "1099_div",
    title: "Dividend Income",
    shortTitle: "1099-DIV",
    description:
      "Dividend distributions.",
  },

  {
    type: "1099_nec",
    title:
      "Nonemployee Compensation",
    shortTitle: "1099-NEC",
    description:
      "Independent contractor income.",
  },

  {
    type: "1099_misc",
    title:
      "Miscellaneous Income",
    shortTitle: "1099-MISC",
    description:
      "Miscellaneous payments.",
  },

  {
    type: "1099_k",
    title:
      "Payment Card Income",
    shortTitle: "1099-K",
    description:
      "Third-party payment network income.",
  },

  {
    type: "1099_r",
    title:
      "Retirement Distribution",
    shortTitle: "1099-R",
    description:
      "IRA and retirement distributions.",
  },

  {
    type: "ssa_1099",
    title:
      "Social Security Benefits",
    shortTitle: "SSA-1099",
    description:
      "Social Security benefit statements.",
  },

  {
    type: "1099_g",
    title:
      "Unemployment Compensation",
    shortTitle: "1099-G",
    description:
      "Unemployment benefits.",
  },

  {
    type: "other",
    title: "Other Income",
    shortTitle: "Other",
    description:
      "Any additional taxable income.",
  },
]