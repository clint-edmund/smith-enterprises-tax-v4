import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
} from "lucide-react"

import type {
  TaxReturnDetails,
} from "@/features/returns/types/return.types"
import {
  formatReturnCurrency,
} from "@/features/returns/utils/return-formatters"

interface ReturnFinancialSummaryProps {
  taxReturn: TaxReturnDetails
}

export function ReturnFinancialSummary({
  taxReturn,
}: ReturnFinancialSummaryProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <CircleDollarSign
          className="size-5 text-blue-700"
          aria-hidden="true"
        />

        <h2 className="font-bold text-slate-950">
          Financial summary
        </h2>
      </div>

      <dl className="mt-5 space-y-3">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-600">
            Preparation fee
          </dt>

          <dd className="font-semibold text-slate-950">
            {formatReturnCurrency(
              taxReturn.preparationFee,
            )}
          </dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-slate-600">
            Discount
          </dt>

          <dd className="font-semibold text-slate-950">
            {formatReturnCurrency(
              taxReturn.discountAmount,
            )}
          </dd>
        </div>

        <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
          <dt className="font-semibold text-slate-950">
            Net preparation fee
          </dt>

          <dd className="text-lg font-bold text-slate-950">
            {formatReturnCurrency(
              taxReturn.netFee,
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <ArrowDownLeft
              className="size-5"
              aria-hidden="true"
            />

            <p className="text-sm font-semibold">
              Estimated refund
            </p>
          </div>

          <p className="mt-2 text-xl font-bold text-emerald-950">
            {formatReturnCurrency(
              taxReturn.estimatedRefund,
            )}
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <ArrowUpRight
              className="size-5"
              aria-hidden="true"
            />

            <p className="text-sm font-semibold">
              Estimated amount due
            </p>
          </div>

          <p className="mt-2 text-xl font-bold text-amber-950">
            {formatReturnCurrency(
              taxReturn.estimatedAmountDue,
            )}
          </p>
        </div>
      </div>
    </section>
  )
}