import {
  useState,
} from "react"

import type {
  PaymentMethod,
  RecordPaymentValues,
} from "../types/payment.types"

interface PaymentFormProps {
  taxReturnId: string
  isSaving: boolean
  onCancel: () => void
  onSave: (
    values: RecordPaymentValues,
  ) => Promise<void>
}

const paymentMethods: Array<{
  value: PaymentMethod
  label: string
}> = [
  {
    value: "cash",
    label: "Cash",
  },
  {
    value: "check",
    label: "Check",
  },
  {
    value: "credit_card",
    label: "Credit Card",
  },
  {
    value: "debit_card",
    label: "Debit Card",
  },
  {
    value: "ach",
    label: "ACH",
  },
  {
    value: "money_order",
    label: "Money Order",
  },
  {
    value: "other",
    label: "Other",
  },
]

function getToday(): string {
  return new Date()
    .toISOString()
    .substring(0, 10)
}

export function PaymentForm({
  taxReturnId,
  isSaving,
  onCancel,
  onSave,
}: PaymentFormProps) {
  const [
    amount,
    setAmount,
  ] = useState("")

  const [
    paymentDate,
    setPaymentDate,
  ] = useState(getToday())

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>("cash")

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
  ] = useState<string | null>(
    null,
  )

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault()

    setErrorMessage(null)

    const numericAmount =
      Number(amount)

    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      numericAmount <= 0
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
      await onSave({
        taxReturnId,
        amount: numericAmount,
        paymentDate,
        paymentMethod,
        referenceNumber,
        notes,
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to record the payment.",
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Amount
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Payment Date
          </label>

          <input
            type="date"
            value={paymentDate}
            onChange={(event) =>
              setPaymentDate(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Payment Method
          </label>

          <select
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(
                event.target
                  .value as PaymentMethod,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {paymentMethods.map(
              (method) => (
                <option
                  key={method.value}
                  value={method.value}
                >
                  {method.label}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Reference Number
          </label>

          <input
            type="text"
            value={referenceNumber}
            onChange={(event) =>
              setReferenceNumber(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Notes
        </label>

        <textarea
          rows={4}
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value,
            )
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : "Record Payment"}
        </button>
      </div>
    </form>
  )
}