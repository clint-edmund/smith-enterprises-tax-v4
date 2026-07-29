import type {
  ReturnPayment,
} from "../types/payment.types"

import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentMethodLabels,
} from "../utils/payment-formatters"

import {
  Button,
} from "@/components/ui/button"

interface Props {
  payment: ReturnPayment

  canVoidPayments: boolean

  onVoidPayment?: (
    payment: ReturnPayment,
  ) => void
}

export function PaymentRow({
  payment,
  canVoidPayments,
  onVoidPayment,
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

          {payment.receiptNumber && (
            <p className="text-xs text-slate-500">
              Receipt #{payment.receiptNumber}
            </p>
          )}

          {payment.referenceNumber &&
            ` • Ref ${payment.referenceNumber}`}
        </p>
      </div>

      <div className="flex items-center gap-3">

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

        {canVoidPayments &&
          !payment.isVoided &&
          onVoidPayment && (

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onVoidPayment(
                  payment,
                )
              }}
            >
              Void
            </Button>

          )}

      </div>
    </div>
  )
}