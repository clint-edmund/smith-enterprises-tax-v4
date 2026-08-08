import type {
  ReturnPaymentSummary,
} from "../types/payment.types"

import {
  formatPaymentAmount,
} from "../utils/payment-formatters"

interface Props {
  summary: ReturnPaymentSummary
}

export function PaymentSummary({
  summary,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <SummaryCard
        title="Net Fee"
        value={formatPaymentAmount(summary.netFee)}
      />

      <SummaryCard
        title="Total Paid"
        value={formatPaymentAmount(summary.totalPaid)}
      />

      <SummaryCard
        title="Outstanding"
        value={formatPaymentAmount(summary.outstandingBalance)}
      />

      <SummaryCard
        title="Payments"
        value={summary.paymentCount.toString()}
      />
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string
}

function SummaryCard({
  title,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  )
}