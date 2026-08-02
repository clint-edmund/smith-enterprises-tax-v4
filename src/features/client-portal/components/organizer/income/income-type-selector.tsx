import {
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  Landmark,
  ReceiptText,
  TrendingUp,
  WalletCards,
} from "lucide-react"

import {
  incomeTypeMetadata,
} from "@/features/client-portal/constants/income.constants"

import type {
  IncomeType,
} from "@/features/client-portal/types/organizer-income.types"

interface IncomeTypeSelectorProps {
  selectedType:
    IncomeType | null

  disabled?: boolean

  onSelect: (
    incomeType:
      IncomeType,
  ) => void

  onCancel: () => void
}

const iconMap: Record<
  IncomeType,
  typeof BriefcaseBusiness
> = {
  w2:
    BriefcaseBusiness,

  "1099_nec":
    Building2,

  "1099_misc":
    ReceiptText,

  "1099_k":
    WalletCards,

  "1099_int":
    Landmark,

  "1099_div":
    TrendingUp,

  "1099_r":
    CircleDollarSign,

  ssa_1099:
    CircleDollarSign,

  "1099_g":
    CircleDollarSign,

  other:
    ReceiptText,
}

export function IncomeTypeSelector({
  selectedType,
  disabled = false,
  onSelect,
  onCancel,
}: IncomeTypeSelectorProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">
          Choose an Income Type
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select the form or income category that best matches the document
          or income source you want to add.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {incomeTypeMetadata.map(
          (incomeType) => {
            const Icon =
              iconMap[
                incomeType.type
              ]

            const selected =
              selectedType ===
              incomeType.type

            return (
              <button
                key={
                  incomeType.type
                }
                type="button"
                disabled={
                  disabled
                }
                aria-pressed={
                  selected
                }
                onClick={() => {
                  onSelect(
                    incomeType.type,
                  )
                }}
                className={[
                  "rounded-2xl border p-5 text-left transition",
                  selected
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                  disabled
                    ? "cursor-not-allowed opacity-60"
                    : "",
                ].join(" ")}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Icon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-950">
                        {
                          incomeType.title
                        }
                      </h3>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {
                          incomeType.shortTitle
                        }
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {
                        incomeType.description
                      }
                    </p>

                    {incomeType.type !==
                      "w2" && (
                      <p className="mt-3 text-xs font-medium text-amber-700">
                        Initial support will use the shared income-source
                        workflow until this form’s detailed fields are added.
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          },
        )}
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <button
          type="button"
          disabled={disabled}
          onClick={
            onCancel
          }
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </section>
  )
}