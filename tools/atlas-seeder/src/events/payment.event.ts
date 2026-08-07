import type {
  GeneratedPayment,
} from "../models/generated-payment"

import {
  getReturnLookupKey,
} from "../workflow/return-lookup"

import type {
  WorkflowContext,
  WorkflowEvent,
} from "../workflow/types"

export class PaymentReceivedEvent
implements WorkflowEvent {
  readonly name: string

  constructor(
    private readonly payment:
      GeneratedPayment,
  ) {
    this.name =
      [
        "Payment",
        payment.clientNumber,
        payment.taxYear,
        `#${payment.paymentSequence}`,
      ].join(" ")
  }

  private getReferenceNumber(): string {
    return [
      "ATLAS",
      this.payment.clientNumber,
      this.payment.taxYear,
      this.payment.paymentSequence,
    ].join("-")
  }

  async execute(
    context: WorkflowContext,
  ): Promise<void> {
    const lookupKey =
      getReturnLookupKey(
        this.payment.clientNumber,
        this.payment.taxYear,
      )

    const returnId =
      context.returnIdsByClientYear.get(
        lookupKey,
      )

    if (!returnId) {
      throw new Error(
        `Unable to resolve tax return ${lookupKey}.`,
      )
    }

    const referenceNumber =
      this.getReferenceNumber()

    /*
     * Atlas development events are deterministic.
     *
     * If this reference already exists, the event
     * has already been successfully executed and
     * must not create another payment.
     */
    const {
      data: existingPayment,
      error: lookupError,
    } = await context.supabase
      .from("payments")
      .select(`
        id,
        receipt_number
      `)
      .eq(
        "reference_number",
        referenceNumber,
      )
      .maybeSingle()

    if (lookupError) {
      throw new Error(
        [
          `Unable to check payment ${referenceNumber}.`,
          lookupError.message,
        ].join("\n"),
      )
    }

    if (existingPayment) {
      console.log(
        `  ↻ Already recorded: ${referenceNumber}`,
      )

      return
    }

    const {
      error,
    } = await context.supabase.rpc(
      "record_return_payment",
      {
        requested_return_id:
          returnId,

        requested_amount:
          this.payment.amount,

        requested_payment_method:
          this.payment.paymentMethod,

        requested_payment_date:
          this.payment.paymentDate,

        requested_reference_number:
          referenceNumber,

        requested_notes:
          this.payment.notes,
      },
    )

    if (error) {
      throw new Error(
        [
          `Payment workflow failed for ${lookupKey}.`,
          error.message,
        ].join("\n"),
      )
    }
  }
}