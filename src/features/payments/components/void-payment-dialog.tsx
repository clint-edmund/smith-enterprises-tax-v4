import {
  useEffect,
  useState,
} from "react"

import {
  formatPaymentAmount,
} from "../utils/payment-formatters"

import type {
  FormEvent,
} from "react"

interface VoidPaymentDialogProps {
  open: boolean
  paymentAmount: number
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: (
    reason: string,
  ) => Promise<void> | void
}

export function VoidPaymentDialog({
  open,
  paymentAmount,
  isSubmitting,
  onCancel,
  onConfirm,
}: VoidPaymentDialogProps) {
  const [
    voidReason,
    setVoidReason,
  ] = useState("")

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setVoidReason("")
      setErrorMessage(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !isSubmitting
      ) {
        onCancel()
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
    onCancel,
    open,
  ])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const normalizedReason =
      voidReason.trim()

    if (!normalizedReason) {
      setErrorMessage(
        "Enter a reason for voiding the payment.",
      )

      return
    }

    setErrorMessage(null)

    await onConfirm(
      normalizedReason,
    )
  }

  if (!open) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="void-payment-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSubmitting
        ) {
          onCancel()
        }
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-6">
          <h2
            id="void-payment-dialog-title"
            className="text-xl font-bold text-slate-950"
          >
            Void Payment
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            You are about to void a payment of{" "}
            <span className="font-semibold text-slate-900">
              {formatPaymentAmount(
                paymentAmount,
              )}
            </span>
            . The transaction will remain in the
            payment history for auditing.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <div className="space-y-5 p-6">
            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
              >
                {errorMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="void-payment-reason"
                className="text-sm font-semibold text-slate-800"
              >
                Reason for voiding
              </label>

              <textarea
                id="void-payment-reason"
                value={voidReason}
                disabled={isSubmitting}
                maxLength={500}
                rows={4}
                onChange={(event) => {
                  setVoidReason(
                    event.target.value,
                  )

                  if (
                    errorMessage
                  ) {
                    setErrorMessage(null)
                  }
                }}
                placeholder="Explain why this payment is being voided."
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <p className="mt-1 text-right text-xs text-slate-500">
                {voidReason.length}/500
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Voiding this payment may change the
              return balance and office payment totals.
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !voidReason.trim()
              }
              className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Voiding Payment..."
                : "Confirm Void"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}