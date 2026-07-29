import type {
  ReturnPayment,
} from "../types/payment.types"

import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentMethodLabels,
} from "../utils/payment-formatters"

interface Props {
  payment: ReturnPayment
}

export function PaymentRow({
  payment,
}: Props) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-none">
      <div>
        <p className="font-medium">
          {formatPaymentDate(
            payment.paymentDate,
          )}
        </p>

        <p className="text-sm text-slate-500">
          {
            paymentMethodLabels[
              payment.paymentMethod
            ]
          }

          {payment.referenceNumber &&
            ` • Ref ${payment.referenceNumber}`}
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          {formatPaymentAmount(
            payment.amount,
          )}
        </p>

        {payment.isVoided && (
          <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
            Voided
          </span>
        )}
      </div>
    </div>
  )
}