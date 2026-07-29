import type {
  ReturnPayment,
} from "../types/payment.types"

import {
  PaymentRow,
} from "./payment-row"

interface Props {
  payments: ReturnPayment[]
}

export function PaymentList({
  payments,
}: Props) {
  if (payments.length === 0) {
    return (
      <p className="py-8 text-center text-slate-500">
        No payments have been recorded.
      </p>
    )
  }

  return (
    <div>
      {payments.map((payment) => (
        <PaymentRow
          key={payment.id}
          payment={payment}
        />
      ))}
    </div>
  )
}