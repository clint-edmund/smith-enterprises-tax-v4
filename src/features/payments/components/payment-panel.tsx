import {
  useState,
} from "react"

import {
  CircleDollarSign,
  Plus,
  RefreshCw,
} from "lucide-react"

import {
  usePayments,
} from "../hooks/use-payments"

import {
  PaymentDialog,
} from "./payment-dialog"

import {
  PaymentList,
} from "./payment-list"

import {
  PaymentSummary,
} from "./payment-summary"

import {
  VoidPaymentDialog,
} from "./void-payment-dialog"

import type {
  ReturnPayment,
} from "../types/payment.types"

import {
  voidReturnPayment,
} from "../services/payment-service"

import {
  useAuthorization,
} from "@/features/authorization/hooks/use-authorization"

interface PaymentPanelProps {
  taxReturnId: string
  onPaymentRecorded?: () => void
}

export function PaymentPanel({
  taxReturnId,
  onPaymentRecorded,
}: PaymentPanelProps) {
  const [
    isDialogOpen,
    setIsDialogOpen,
  ] = useState(false)

  const [
    selectedPayment,
    setSelectedPayment,
  ] =
    useState<ReturnPayment | null>(
      null,
    )

  const [
    isVoidDialogOpen,
    setIsVoidDialogOpen,
  ] = useState(false)

  const [
    isVoidingPayment,
    setIsVoidingPayment,
  ] = useState(false)

  const {
    payments,
    summary,
    isLoading,
    isRefreshing,
    errorMessage,
    refreshPayments,
  } = usePayments(taxReturnId)

  const {
    hasPermission,
    permissions,
  } = useAuthorization()

  const canRecordPayments =
    hasPermission(
      permissions.payments.record,
    )

  const canVoidPayments =
    hasPermission(
      permissions.payments.void,
    )

  async function handleVoidPayment(
    reason: string,
  ) {
    if (!selectedPayment) {
      return
    }

    setIsVoidingPayment(true)

    try {

      await voidReturnPayment({
        paymentId:
          selectedPayment.id,

        voidReason:
          reason,
      })

      setIsVoidDialogOpen(false)

      setSelectedPayment(null)

      await refreshPayments()

      onPaymentRecorded?.()

    } finally {

      setIsVoidingPayment(false)

    }
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
        <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>

        <div className="mt-6 h-32 animate-pulse rounded-xl bg-slate-100" />
      </section>
    )
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5">
              <CircleDollarSign
                className="size-5 text-emerald-700"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Payments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review payment history and the
                outstanding return balance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={() => {
                void refreshPayments()

                onPaymentRecorded?.()
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`size-4 ${
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }`}
                aria-hidden="true"
              />

              Refresh
            </button>

            {canRecordPayments && (
              <button
                type="button"
                onClick={() => {
                  setIsDialogOpen(true)
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <Plus
                  className="size-4"
                  aria-hidden="true"
                />

                Record Payment
              </button>
            )}
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-900">
              Unable to load payments
            </p>

            <p className="mt-1 text-sm text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => {
                void refreshPayments()
              }}
              className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <PaymentSummary
                summary={summary}
              />
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-slate-950">
                  Payment history
                </h3>

                <span className="text-sm text-slate-500">
                  {payments.length}{" "}
                  {payments.length === 1
                    ? "record"
                    : "records"}
                </span>
              </div>

              <PaymentList
                payments={payments}
                canVoidPayments={canVoidPayments}
                onVoidPayment={(
                  payment,
                ) => {

                  setSelectedPayment(
                    payment,
                  )

                  setIsVoidDialogOpen(
                    true,
                  )

                }}
              />
            </div>
          </>
        )}
      </section>

      {canRecordPayments && (
        <PaymentDialog
          open={isDialogOpen}
          taxReturnId={taxReturnId}
          onClose={() => {
            setIsDialogOpen(false)
          }}
          onPaymentRecorded={() => {
            void refreshPayments()
          }}
        />
      )}
      {canVoidPayments && (
        <VoidPaymentDialog
          open={isVoidDialogOpen}
          paymentAmount={
            selectedPayment?.amount ??
            0
          }
          isSubmitting={
            isVoidingPayment
          }
          onCancel={() => {
            setIsVoidDialogOpen(false)
            setSelectedPayment(null)
          }}
          onConfirm={
            handleVoidPayment
          }
        />
      )}
    </>
  )
}