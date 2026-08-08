import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  Hash,
  ReceiptText,
  UserRound,
  X,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"

import type {
  PaymentMethod,
  PaymentReceiptDetails,
  RecordPaymentValues,
} from "@/features/payments/types/payment.types"
import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentMethodLabels,
} from "@/features/payments/utils/payment-formatters"

export interface EditPaymentValues
  extends Omit<RecordPaymentValues, "taxReturnId"> {
  paymentId: string
}

interface PaymentEditDialogProps {
  payment: PaymentReceiptDetails
  isSaving?: boolean
  onClose: () => void
  onSave: (
    values: EditPaymentValues,
  ) => Promise<void> | void
}

interface FormErrors {
  amount?: string
  paymentDate?: string
  paymentMethod?: string
}

const paymentMethodOptions = Object.entries(
  paymentMethodLabels,
) as Array<[PaymentMethod, string]>

export function PaymentEditDialog({
  payment,
  isSaving = false,
  onClose,
  onSave,
}: PaymentEditDialogProps) {
  const [amount, setAmount] = useState(
    payment.amount.toFixed(2),
  )
  const [paymentDate, setPaymentDate] = useState(
    payment.paymentDate.slice(0, 10),
  )
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(
      payment.paymentMethod,
    )
  const [referenceNumber, setReferenceNumber] =
    useState(payment.referenceNumber ?? "")
  const [notes, setNotes] = useState(
    payment.notes ?? "",
  )
  const [errors, setErrors] =
    useState<FormErrors>({})

  const hasChanges = useMemo(() => {
    return (
      amount !== payment.amount.toFixed(2) ||
      paymentDate !==
        payment.paymentDate.slice(0, 10) ||
      paymentMethod !== payment.paymentMethod ||
      referenceNumber.trim() !==
        (payment.referenceNumber ?? "") ||
      notes.trim() !== (payment.notes ?? "")
    )
  }, [
    amount,
    notes,
    payment,
    paymentDate,
    paymentMethod,
    referenceNumber,
  ])

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isSaving
      ) {
        onClose()
      }
    }

    const originalOverflow =
      document.body.style.overflow

    document.body.style.overflow = "hidden"
    document.addEventListener(
      "keydown",
      handleKeyDown,
    )

    return () => {
      document.body.style.overflow =
        originalOverflow
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      )
    }
  }, [isSaving, onClose])

  function validateForm() {
    const nextErrors: FormErrors = {}
    const parsedAmount = Number(amount)

    if (!amount.trim()) {
      nextErrors.amount =
        "Enter a payment amount."
    } else if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      nextErrors.amount =
        "Payment amount must be greater than zero."
    }

    if (!paymentDate) {
      nextErrors.paymentDate =
        "Select a payment date."
    }

    if (!paymentMethod) {
      nextErrors.paymentMethod =
        "Select a payment method."
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    await onSave({
      paymentId: payment.paymentId,
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      referenceNumber:
        referenceNumber.trim(),
      notes: notes.trim(),
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-payment-dialog-title"
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 sm:p-8"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSaving
        ) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
              Payment Management
            </p>

            <h2
              id="edit-payment-dialog-title"
              className="mt-1 text-2xl font-bold tracking-tight text-slate-950"
            >
              Edit Payment
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Update the selected payment transaction.
              The receipt number and related return cannot
              be changed.
            </p>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="Close edit payment dialog"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X
              className="size-5"
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="grid gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <ReceiptText className="size-4" />
              Receipt
            </div>
            <p className="mt-2 font-semibold text-slate-950">
              {payment.receiptNumber
                ? `#${payment.receiptNumber}`
                : "Not issued"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <UserRound className="size-4" />
              Client
            </div>
            <p className="mt-2 font-semibold text-slate-950">
              {payment.clientName}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <FileText className="size-4" />
              Return
            </div>
            <p className="mt-2 font-semibold text-slate-950">
              {payment.taxYear} {payment.returnType}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <CircleDollarSign className="size-4" />
              Current Amount
            </div>
            <p className="mt-2 font-semibold text-slate-950">
              {formatPaymentAmount(payment.amount)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <CalendarDays className="size-4" />
              Recorded
            </div>
            <p className="mt-2 font-semibold text-slate-950">
              {formatPaymentDate(payment.createdAt)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Hash className="size-4" />
              Recorded By
            </div>
            <p className="mt-2 font-semibold text-slate-950">
              {payment.createdByName}
            </p>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-payment-amount"
                  className="text-sm font-semibold text-slate-800"
                >
                  Payment Amount
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-slate-500">
                    $
                  </span>
                  <input
                    id="edit-payment-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    disabled={isSaving}
                    onChange={(event) => {
                      setAmount(event.target.value)
                      setErrors((current) => ({
                        ...current,
                        amount: undefined,
                      }))
                    }}
                    aria-invalid={Boolean(errors.amount)}
                    aria-describedby={
                      errors.amount
                        ? "edit-payment-amount-error"
                        : undefined
                    }
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-7 pr-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>
                {errors.amount && (
                  <p
                    id="edit-payment-amount-error"
                    className="mt-2 text-sm text-red-700"
                  >
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-payment-date"
                  className="text-sm font-semibold text-slate-800"
                >
                  Payment Date
                </label>
                <input
                  id="edit-payment-date"
                  type="date"
                  value={paymentDate}
                  disabled={isSaving}
                  onChange={(event) => {
                    setPaymentDate(event.target.value)
                    setErrors((current) => ({
                      ...current,
                      paymentDate: undefined,
                    }))
                  }}
                  aria-invalid={Boolean(
                    errors.paymentDate,
                  )}
                  aria-describedby={
                    errors.paymentDate
                      ? "edit-payment-date-error"
                      : undefined
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
                {errors.paymentDate && (
                  <p
                    id="edit-payment-date-error"
                    className="mt-2 text-sm text-red-700"
                  >
                    {errors.paymentDate}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-payment-method"
                  className="text-sm font-semibold text-slate-800"
                >
                  Payment Method
                </label>
                <select
                  id="edit-payment-method"
                  value={paymentMethod}
                  disabled={isSaving}
                  onChange={(event) => {
                    setPaymentMethod(
                      event.target.value as PaymentMethod,
                    )
                    setErrors((current) => ({
                      ...current,
                      paymentMethod: undefined,
                    }))
                  }}
                  aria-invalid={Boolean(
                    errors.paymentMethod,
                  )}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  {paymentMethodOptions.map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ),
                  )}
                </select>
                {errors.paymentMethod && (
                  <p className="mt-2 text-sm text-red-700">
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="edit-payment-reference"
                  className="text-sm font-semibold text-slate-800"
                >
                  Reference Number
                </label>
                <input
                  id="edit-payment-reference"
                  type="text"
                  value={referenceNumber}
                  disabled={isSaving}
                  onChange={(event) => {
                    setReferenceNumber(
                      event.target.value,
                    )
                  }}
                  placeholder="Check, confirmation, or transaction number"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-payment-notes"
                className="text-sm font-semibold text-slate-800"
              >
                Notes
              </label>
              <textarea
                id="edit-payment-notes"
                rows={4}
                value={notes}
                disabled={isSaving}
                onChange={(event) => {
                  setNotes(event.target.value)
                }}
                placeholder="Optional internal payment notes"
                className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            {payment.isVoided && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                This payment has been voided and cannot
                be edited.
              </div>
            )}
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSaving ||
                payment.isVoided ||
                !hasChanges
              }
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
