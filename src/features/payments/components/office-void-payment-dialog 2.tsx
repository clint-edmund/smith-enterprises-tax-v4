import {
  Ban,
  TriangleAlert,
} from "lucide-react"
import {
  useEffect,
  useState,
} from "react"
import type {
  FormEvent,
} from "react"

import {
  voidReturnPayment,
} from "@/features/payments/services/payment-service"
import type {
  OfficePaymentRecord,
} from "@/features/payments/types/payment.types"
import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentMethodLabels,
} from "@/features/payments/utils/payment-formatters"

interface OfficeVoidPaymentDialogProps {
  payment: OfficePaymentRecord
  onClose: () => void
  onPaymentVoided: (
    paymentId: string,
  ) => Promise<void> | void
}

const commonReasons = [
  "Duplicate payment",
  "Incorrect amount",
  "NSF or returned payment",
  "Entered in error",
  "Customer refund",
]

export function OfficeVoidPaymentDialog({
  payment,
  onClose,
  onPaymentVoided,
}: OfficeVoidPaymentDialogProps) {
  const [
    selectedReason,
    setSelectedReason,
  ] = useState("")

  const [
    customReason,
    setCustomReason,
  ] = useState("")

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const reason =
    selectedReason === "other"
      ? customReason.trim()
      : selectedReason.trim()

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

    if (!reason) {
      setErrorMessage(
        "Select or enter a reason for voiding this payment.",
      )
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      const result =
        await voidReturnPayment({
          paymentId:
            payment.paymentId,
          voidReason: reason,
        })

      await onPaymentVoided(
        result.payment.id,
      )
    } catch (error) {
      console.error(
        "Unable to void payment:",
        error,
      )

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to void the payment.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="void-payment-dialog-title"
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
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-100 p-3">
              <TriangleAlert
                className="size-6 text-red-700"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2
                id="void-payment-dialog-title"
                className="text-xl font-bold text-red-950"
              >
                Void Payment
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-800">
                This reverses the payment for accounting purposes. The original transaction remains in the audit history and cannot be deleted.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <div className="space-y-5 p-6">
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">
                Payment being voided
              </p>

              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">
                    Client
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {payment.clientName}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">
                    Amount
                  </dt>
                  <dd className="mt-1 font-bold text-slate-950">
                    {formatPaymentAmount(
                      payment.amount,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">
                    Return
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {payment.taxYear} {payment.taxForm} · {payment.returnType}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">
                    Payment details
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {paymentMethodLabels[
                      payment.paymentMethod
                    ]} · {formatPaymentDate(
                      payment.paymentDate,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">
                    Receipt
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {payment.receiptNumber
                      ? `#${payment.receiptNumber}`
                      : "Not issued"}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">
                    Reference
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {payment.referenceNumber ??
                      "Not provided"}
                  </dd>
                </div>
              </dl>
            </section>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
              >
                {errorMessage}
              </div>
            )}

            <fieldset>
              <legend className="text-sm font-semibold text-slate-800">
                Reason for voiding
              </legend>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {commonReasons.map(
                  (reasonOption) => (
                    <label
                      key={reasonOption}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="void-reason"
                        value={reasonOption}
                        checked={
                          selectedReason ===
                          reasonOption
                        }
                        disabled={isSubmitting}
                        onChange={(event) => {
                          setSelectedReason(
                            event.target.value,
                          )
                          setErrorMessage(null)
                        }}
                        className="mt-0.5 size-4"
                      />

                      <span className="text-sm font-medium text-slate-700">
                        {reasonOption}
                      </span>
                    </label>
                  ),
                )}

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="void-reason"
                    value="other"
                    checked={
                      selectedReason === "other"
                    }
                    disabled={isSubmitting}
                    onChange={(event) => {
                      setSelectedReason(
                        event.target.value,
                      )
                      setErrorMessage(null)
                    }}
                    className="mt-0.5 size-4"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Other reason
                  </span>
                </label>
              </div>
            </fieldset>

            {selectedReason === "other" && (
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  Explain the reason
                </span>

                <textarea
                  rows={4}
                  required
                  autoFocus
                  maxLength={500}
                  value={customReason}
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setCustomReason(
                      event.target.value,
                    )
                    setErrorMessage(null)
                  }}
                  placeholder="Enter a clear audit reason for voiding this payment."
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:bg-slate-100"
                />

                <span className="mt-1 block text-right text-xs text-slate-500">
                  {customReason.length}/500
                </span>
              </label>
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <strong>Important:</strong> Confirm that you selected the correct transaction. Voiding will update payment totals and restore the amount to the return&apos;s outstanding balance.
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !reason
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Ban
                className="size-4"
                aria-hidden="true"
              />

              {isSubmitting
                ? "Voiding Payment..."
                : "Void Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
