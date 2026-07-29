import { supabase } from "@/services/supabase"

import type {
  RecordPaymentResult,
  RecordPaymentValues,
  ReturnPayment,
  ReturnPaymentSummary,
  VoidPaymentResult,
  VoidPaymentValues,
} from "../types/payment.types"

type NumericDatabaseValue =
  number |
  string |
  null

function toNumber(
  value: NumericDatabaseValue,
): number {
  if (value === null) {
    return 0
  }

  const convertedValue =
    Number(value)

  return Number.isFinite(
    convertedValue,
  )
    ? convertedValue
    : 0
}

function normalizeOptionalString(
  value: string,
): string | undefined {
  const normalizedValue =
    value.trim()

  return normalizedValue
    ? normalizedValue
    : undefined
}

export function getPaymentServiceErrorMessage(
  error: unknown,
): string {
  let message =
    "An unexpected payment error occurred."

  if (error instanceof Error) {
    message = error.message
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    message = error.message
  }

  const normalizedMessage =
    message.toLowerCase()
  
  if (
    normalizedMessage.includes(
      "void reason is required",
    )
  ) {
    return "Enter a reason for voiding the payment."
  }

  if (
    normalizedMessage.includes(
      "already been voided",
    )
  ) {
    return "This payment has already been voided."
  }

  if (
    normalizedMessage.includes(
      "payment was not found",
    )
  ) {
    return "The selected payment is no longer available."
  }

  if (
    normalizedMessage.includes(
      "not authorized to void payments",
    )
  ) {
    return "Only administrators and managers can void payments."
  }

  if (
    normalizedMessage.includes(
      "amount must be greater",
    )
  ) {
    return "Enter a payment amount greater than $0.00."
  }

  if (
    normalizedMessage.includes(
      "payment method is required",
    )
  ) {
    return "Select a payment method."
  }

  if (
    normalizedMessage.includes(
      "payment date is required",
    )
  ) {
    return "Enter the payment date."
  }

  if (
    normalizedMessage.includes(
      "tax return was not found",
    )
  ) {
    return "The selected tax return is no longer available."
  }

  if (
    normalizedMessage.includes(
      "not authorized",
    ) ||
    normalizedMessage.includes(
      "permission denied",
    )
  ) {
    return "You are not authorized to manage payments."
  }

  return message
}

export async function getReturnPayments(
  taxReturnId: string,
): Promise<ReturnPayment[]> {
  const normalizedReturnId =
    taxReturnId.trim()

  if (!normalizedReturnId) {
    throw new Error(
      "A tax-return identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_return_payments",
    {
      requested_return_id:
        normalizedReturnId,
    },
  )

  if (error) {
    throw new Error(
      getPaymentServiceErrorMessage(
        error,
      ),
    )
  }

  return (data ?? []).map(
    (payment) => ({
      id:
        payment.id,

      taxReturnId:
        payment.tax_return_id,

      clientId:
        payment.client_id,

      amount:
        toNumber(payment.amount),

      paymentDate:
        payment.payment_date,

      paymentMethod:
        payment.payment_method,

      referenceNumber:
        payment.reference_number,

      notes:
        payment.notes,

      receiptNumber: payment.receipt_number,

      receiptIssuedAt: payment.receipt_issued_at,

      receiptIssuedBy: payment.receipt_issued_by,

      isVoided:
        payment.is_voided,

      voidedAt:
        payment.voided_at,

      voidedBy:
        payment.voided_by,

      voidReason:
        payment.void_reason,

      createdBy:
        payment.created_by,

      createdByName:
        payment.created_by_name ??
        "System",

      createdAt:
        payment.created_at,

      updatedAt:
        payment.updated_at,
    }),
  )
}

export async function getReturnPaymentSummary(
  taxReturnId: string,
): Promise<ReturnPaymentSummary> {
  const normalizedReturnId =
    taxReturnId.trim()

  if (!normalizedReturnId) {
    throw new Error(
      "A tax-return identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_return_payment_summary",
    {
      requested_return_id:
        normalizedReturnId,
    },
  )

  if (error) {
    throw new Error(
      getPaymentServiceErrorMessage(
        error,
      ),
    )
  }

  const summary =
    data?.[0]

  if (!summary) {
    return {
      preparationFee: 0,
      discountAmount: 0,
      netFee: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      paymentCount: 0,
    }
  }

  return {
    preparationFee:
      toNumber(
        summary.preparation_fee,
      ),

    discountAmount:
      toNumber(
        summary.discount_amount,
      ),

    netFee:
      toNumber(
        summary.net_fee,
      ),

    totalPaid:
      toNumber(
        summary.total_paid,
      ),

    outstandingBalance:
      toNumber(
        summary.outstanding_balance,
      ),

    paymentCount:
      Number(
        summary.payment_count,
      ),
  }
}

export async function recordReturnPayment(
  values: RecordPaymentValues,
): Promise<RecordPaymentResult> {
  const normalizedReturnId =
    values.taxReturnId.trim()

  if (!normalizedReturnId) {
    throw new Error(
      "A tax-return identifier is required.",
    )
  }

  if (
    !Number.isFinite(values.amount) ||
    values.amount <= 0
  ) {
    throw new Error(
      "Enter a payment amount greater than $0.00.",
    )
  }

  if (!values.paymentDate) {
    throw new Error(
      "Enter the payment date.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "record_return_payment",
    {
      requested_return_id:
        normalizedReturnId,

      requested_amount:
        values.amount,

      requested_payment_method:
        values.paymentMethod,

      requested_payment_date:
        values.paymentDate,

      requested_reference_number:
        normalizeOptionalString(
          values.referenceNumber,
        ),

      requested_notes:
        normalizeOptionalString(
          values.notes,
        ),
    },
  )

  if (error) {
    throw new Error(
      getPaymentServiceErrorMessage(
        error,
      ),
    )
  }

  if (!data) {
    throw new Error(
      "Supabase did not return the recorded payment.",
    )
  }

  const payment = Array.isArray(data)
    ? data[0]
    : data

  if (!payment) {
    throw new Error(
      "Supabase did not return the recorded payment.",
    )
  }

  return {
    payment: {
      id:
        payment.id,

      taxReturnId:
        payment.tax_return_id ?? normalizedReturnId,

      clientId:
        payment.client_id,

      amount:
        toNumber(payment.amount),

      paymentDate:
        payment.payment_date,

      paymentMethod:
        payment.payment_method,

      referenceNumber:
        payment.reference_number,

      notes:
        payment.notes,

      receiptNumber: data.receipt_number,
      receiptIssuedAt: data.receipt_issued_at,
      receiptIssuedBy: data.receipt_issued_by,

      isVoided:
        payment.is_voided,

      voidedAt:
        payment.voided_at,

      voidedBy:
        payment.voided_by,
      
      voidReason:
        payment.void_reason,

      createdBy:
        payment.created_by,

      createdByName:
        "Current user",

      createdAt:
        payment.created_at,

      updatedAt:
        payment.updated_at,
    },

    message:
      "The payment was recorded successfully.",
  }
}
export async function voidReturnPayment(
  values: VoidPaymentValues,
): Promise<VoidPaymentResult> {
  const normalizedPaymentId =
    values.paymentId.trim()

  const normalizedVoidReason =
    values.voidReason.trim()

  if (!normalizedPaymentId) {
    throw new Error(
      "A payment identifier is required.",
    )
  }

  if (!normalizedVoidReason) {
    throw new Error(
      "Enter a reason for voiding the payment.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "void_return_payment",
    {
      requested_payment_id:
        normalizedPaymentId,

      requested_void_reason:
        normalizedVoidReason,
    },
  )

  if (error) {
    throw new Error(
      getPaymentServiceErrorMessage(
        error,
      ),
    )
  }

  if (!data) {
    throw new Error(
      "Supabase did not return the voided payment.",
    )
  }

  const payment =
    Array.isArray(data)
      ? data[0]
      : data

  if (!payment) {
    throw new Error(
      "Supabase did not return the voided payment.",
    )
  }


  return {
    payment: {
      id:
        payment.id,

      taxReturnId:
        payment.tax_return_id,

      clientId:
        payment.client_id,

      amount:
        toNumber(payment.amount),

      paymentDate:
        payment.payment_date,

      paymentMethod:
        payment.payment_method,

      referenceNumber:
        payment.reference_number,

      notes:
        payment.notes,

      receiptNumber: data.receipt_number,
      receiptIssuedAt: data.receipt_issued_at,
      receiptIssuedBy: data.receipt_issued_by,

      isVoided:
        payment.is_voided,

      voidedAt:
        payment.voided_at,

      voidedBy:
        payment.voided_by,

      voidReason:
        payment.void_reason,

      createdBy:
        payment.created_by,

      createdByName:
        "System",

      createdAt:
        payment.created_at,

      updatedAt:
        payment.updated_at,
    },

    message:
      "The payment was voided successfully.",
  }
}