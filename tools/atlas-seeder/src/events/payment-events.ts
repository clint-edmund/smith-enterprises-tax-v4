import {
  PaymentReceivedEvent,
} from "./payment.event"

import type {
  GeneratedPayment,
} from "../models/generated-payment"

import type {
  WorkflowEvent,
} from "../workflow/types"

export function createPaymentEvents(
  payments: readonly GeneratedPayment[],
): WorkflowEvent[] {
  return payments.map(
    (payment) =>
      new PaymentReceivedEvent(
        payment,
      ),
  )
}