import {
  useEffect,
  useState,
} from "react"
import type {
  FormEvent,
} from "react"

import {
  recordReturnPayment,
} from "@/features/payments/services/payment-service"
import type {
  OfficePaymentRecord,
  PaymentMethod,
} from "@/features/payments/types/payment.types"
import {
  formatPaymentAmount,
  paymentMethodLabels,
} from "@/features/payments/utils/payment-formatters"

interface RecordPaymentDialogProps {
  payment: OfficePaymentRecord
  onClose: () => void
  onPaymentRecorded: (
    paymentId: string,
  ) => Promise<void> | void
}

const paymentMethods: PaymentMethod[] = [
  "cash",
  "check",
  "credit_card",
  "debit_card",
  "ach",
  "money_order",
  "other",
]

function getTodayValue(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, "0")
  const day = String(
    today.getDate(),
  ).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function RecordPaymentDialog({
  payment,
  onClose,
  onPaymentRecorded,
}: RecordPaymentDialogProps) {
  const [
    amount,
    setAmount,
  ] = useState("")
  const [
    paymentDate,
    setPaymentDate,
  ] = useState(getTodayValue)
  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>("cash")
  const [
    referenceNumber,
    setReferenceNumber,
  ] = useState("")
  const [
    notes,
    setNotes,
  ] = useState("")
  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isSubmitting
      ) {
        onClose()
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    )

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      )
    }
  }, [
    isSubmitting,
    onClose,
  ])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const normalizedAmount =
      Number(amount)

    if (
      !Number.isFinite(normalizedAmount) ||
      normalizedAmount <= 0
    ) {
      setErrorMessage(
        "Enter a payment amount greater than $0.00.",
      )
      return
    }

    if (!paymentDate) {
      setErrorMessage(
        "Enter the payment date.",
      )
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      const result =
        await recordReturnPayment({
          taxReturnId:
            payment.taxReturnId,
          amount: normalizedAmount,
          paymentDate,
          paymentMethod,
          referenceNumber,
          notes,
        })

      await onPaymentRecorded(
        result.payment.id,
      )
    } catch (error) {
      console.error(
        "Unable to record payment:",
        error,
      )

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to record the payment.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-payment-dialog-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 sm:p-8"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSubmitting
        ) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-6">
          <h2
            id="record-payment-dialog-title"
            className="text-xl font-bold text-slate-950"
          >
            Record Payment
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Add another payment for {payment.clientName}&apos;s {payment.taxYear} {payment.taxForm} return.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <div className="space-y-5 p-6">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-950">
                Selected return
              </p>

              <p className="mt-1 text-sm text-blue-800">
                {payment.clientName} · {payment.taxYear} {payment.taxForm} · {payment.returnType}
              </p>

              <p className="mt-1 text-xs text-blue-700">
                Existing transaction shown: {formatPaymentAmount(payment.amount)}
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
              >
                {errorMessage}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Amount
                </span>

                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-slate-500">
                    $
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    required
                    autoFocus
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value)
                    }}
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-7 pr-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Payment Date
                </span>

                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(event) => {
                    setPaymentDate(
                      event.target.value,
                    )
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Payment Method
              </span>

              <select
                value={paymentMethod}
                onChange={(event) => {
                  setPaymentMethod(
                    event.target.value as PaymentMethod,
                  )
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              >
                {paymentMethods.map(
                  (method) => (
                    <option
                      key={method}
                      value={method}
                    >
                      {paymentMethodLabels[method]}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Reference Number
              </span>

              <input
                type="text"
                value={referenceNumber}
                onChange={(event) => {
                  setReferenceNumber(
                    event.target.value,
                  )
                }}
                placeholder="Check number, confirmation number, or transaction ID"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Notes
              </span>

              <textarea
                rows={4}
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value)
                }}
                placeholder="Optional internal payment notes"
                className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Recording Payment..."
                : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
