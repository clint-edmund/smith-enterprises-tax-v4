import {
  Ban,
  Download,
  History,
  Printer,
  ReceiptText,
  RefreshCw,
  WalletCards,
  X,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  Link,
} from "react-router-dom"

import {
  getClientDetailsRoute,
  getReturnDetailsRoute,
} from "@/config/app-config"
import {
  PaymentReceipt,
} from "@/features/payments/components/payment-receipt"
import type {
  PaymentReceiptDetails,
} from "@/features/payments/types/payment.types"
import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentMethodLabels,
} from "@/features/payments/utils/payment-formatters"
import {
  generatePaymentReceiptPdf,
} from "@/features/payments/utils/payment-pdf"
import {
  WorkflowTimeline,
} from "@/features/returns/components/workflow-timeline"
import {
  useReturnWorkflowHistory,
} from "@/features/returns/hooks/use-return-workflow-history"

interface PaymentDetailsDialogProps {
  receipt: PaymentReceiptDetails
  canVoidPayment: boolean
  onClose: () => void
  onPrintReceipt: () => void
  onRecordPayment: () => void
  onVoidPayment: () => void
}

type DetailsTab =
  | "receipt"
  | "timeline"

function getPaymentIdFromEventData(
  eventData: unknown,
): string | null {
  if (
    typeof eventData !== "object" ||
    eventData === null ||
    Array.isArray(eventData)
  ) {
    return null
  }

  const paymentId =
    (eventData as Record<string, unknown>)
      .payment_id

  return typeof paymentId === "string"
    ? paymentId
    : null
}

export function PaymentDetailsDialog({
  receipt,
  canVoidPayment,
  onClose,
  onPrintReceipt,
  onRecordPayment,
  onVoidPayment,
}: PaymentDetailsDialogProps) {
  const receiptRef =
    useRef<HTMLDivElement | null>(null)

  const [
    activeTab,
    setActiveTab,
  ] = useState<DetailsTab>("receipt")

  const [
    isDownloadingPdf,
    setIsDownloadingPdf,
  ] = useState(false)

  const {
    events,
    isLoading: isTimelineLoading,
    errorMessage: timelineErrorMessage,
    refresh: refreshTimeline,
  } = useReturnWorkflowHistory(
    receipt.taxReturnId,
  )

  const paymentEvents =
    useMemo(
      () =>
        events.filter(
          (event) =>
            getPaymentIdFromEventData(
              event.eventData,
            ) === receipt.paymentId,
        ),
      [
        events,
        receipt.paymentId,
      ],
    )

  async function handleDownloadPdf() {
    if (!receiptRef.current) {
      window.alert(
        "The receipt preview is not available for PDF export.",
      )
      return
    }

    try {
      setIsDownloadingPdf(true)

      await generatePaymentReceiptPdf({
        element: receiptRef.current,
        receiptNumber: receipt.receiptNumber,
      })
    } catch (error) {
      console.error(
        "Unable to generate payment receipt PDF:",
        error,
      )

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to generate the payment receipt PDF.",
      )
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
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
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-details-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 sm:p-8"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-slate-100 shadow-2xl">
        <header className="border-b border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
                Payment Transaction
              </p>

              <h2
                id="payment-details-title"
                className="mt-1 text-2xl font-bold tracking-tight text-slate-950"
              >
                Payment Details
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Receipt{" "}
                {receipt.receiptNumber
                  ? `#${receipt.receiptNumber}`
                  : "not issued"}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close payment details"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X
                className="size-5"
                aria-hidden="true"
              />
            </button>
          </div>
        </header>

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Payment amount
                  </p>

                  <p
                    className={`mt-2 text-3xl font-bold tracking-tight ${
                      receipt.isVoided
                        ? "text-slate-500 line-through"
                        : "text-slate-950"
                    }`}
                  >
                    {formatPaymentAmount(
                      receipt.amount,
                    )}
                  </p>
                </div>

                {receipt.isVoided ? (
                  <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-800">
                    Voided
                  </span>
                ) : (
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
                    Completed
                  </span>
                )}
              </div>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Payment date
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {formatPaymentDate(
                      receipt.paymentDate,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Payment method
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {
                      paymentMethodLabels[
                        receipt.paymentMethod
                      ]
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Reference number
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {receipt.referenceNumber ||
                      "Not provided"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Recorded by
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {receipt.createdByName}
                  </dd>
                </div>
              </dl>

              {receipt.notes && (
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {receipt.notes}
                  </p>
                </div>
              )}
            </section>

            {receipt.isVoided && (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <h3 className="font-bold text-red-950">
                  Void information
                </h3>

                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-red-700">
                      Voided by
                    </dt>

                    <dd className="mt-1 text-sm font-semibold text-red-950">
                      {receipt.voidedByName ||
                        "Unknown user"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-red-700">
                      Void date
                    </dt>

                    <dd className="mt-1 text-sm font-semibold text-red-950">
                      {receipt.voidedAt
                        ? formatPaymentDate(
                            receipt.voidedAt,
                          )
                        : "Not available"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                    Reason
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-900">
                    {receipt.voidReason ||
                      "No reason was recorded."}
                  </p>
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 pt-4">
                <div
                  role="tablist"
                  aria-label="Payment receipt information"
                  className="flex gap-6"
                >
                  <button
                    type="button"
                    role="tab"
                    id="payment-receipt-tab"
                    aria-selected={
                      activeTab === "receipt"
                    }
                    aria-controls="payment-receipt-panel"
                    onClick={() => {
                      setActiveTab("receipt")
                    }}
                    className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition ${
                      activeTab === "receipt"
                        ? "border-blue-700 text-blue-700"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <ReceiptText
                      className="size-4"
                      aria-hidden="true"
                    />

                    Receipt
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="payment-timeline-tab"
                    aria-selected={
                      activeTab === "timeline"
                    }
                    aria-controls="payment-timeline-panel"
                    onClick={() => {
                      setActiveTab("timeline")
                    }}
                    className={`inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition ${
                      activeTab === "timeline"
                        ? "border-blue-700 text-blue-700"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <History
                      className="size-4"
                      aria-hidden="true"
                    />

                    Timeline
                  </button>
                </div>
              </div>

              {activeTab === "receipt" ? (
                <div
                  role="tabpanel"
                  id="payment-receipt-panel"
                  aria-labelledby="payment-receipt-tab"
                  className="overflow-x-auto p-3 sm:p-5"
                >
                  <div ref={receiptRef}>
                    <PaymentReceipt
                      receipt={receipt}
                    />
                  </div>
                </div>
              ) : (
                <div
                  role="tabpanel"
                  id="payment-timeline-panel"
                  aria-labelledby="payment-timeline-tab"
                  className="p-5"
                >
                  {isTimelineLoading ? (
                    <div
                      role="status"
                      className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center"
                    >
                      <RefreshCw
                        className="mx-auto size-6 animate-spin text-slate-400"
                        aria-hidden="true"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Loading payment timeline...
                      </p>
                    </div>
                  ) : timelineErrorMessage ? (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 p-5"
                    >
                      <p className="font-semibold text-red-900">
                        Unable to load the payment timeline
                      </p>

                      <p className="mt-2 text-sm text-red-700">
                        {timelineErrorMessage}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          void refreshTimeline()
                        }}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      >
                        <RefreshCw
                          className="size-4"
                          aria-hidden="true"
                        />

                        Try Again
                      </button>
                    </div>
                  ) : (
                    <WorkflowTimeline
                      events={paymentEvents}
                      emptyTitle="No payment timeline events"
                      emptyDescription="Payment activity will appear here after workflow events are recorded for this transaction."
                    />
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-950">
                Client and return
              </h3>

              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Client
                  </dt>

                  <dd className="mt-1">
                    <Link
                      to={getClientDetailsRoute(
                        receipt.clientId,
                      )}
                      onClick={onClose}
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      {receipt.clientName}
                    </Link>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Client number
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {receipt.clientNumber ??
                      "Not assigned"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Tax return
                  </dt>

                  <dd className="mt-1">
                    <Link
                      to={getReturnDetailsRoute(
                        receipt.taxReturnId,
                      )}
                      onClick={onClose}
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      {receipt.taxYear}{" "}
                      {receipt.returnType}
                    </Link>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Receipt issued by
                  </dt>

                  <dd className="mt-1 font-semibold text-slate-900">
                    {receipt.receiptIssuedByName}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold text-slate-950">
                Actions
              </h3>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={onPrintReceipt}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <Printer
                    className="size-4"
                    aria-hidden="true"
                  />

                  Print Receipt
                </button>

                <button
                  type="button"
                  disabled={isDownloadingPdf}
                  onClick={() => {
                    void handleDownloadPdf()
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <Download
                    className="size-4"
                    aria-hidden="true"
                  />

                  {isDownloadingPdf
                    ? "Preparing PDF..."
                    : "Download PDF"}
                </button>

                <button
                  type="button"
                  onClick={onRecordPayment}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <WalletCards
                    className="size-4"
                    aria-hidden="true"
                  />

                  Record Another Payment
                </button>

                {canVoidPayment &&
                  !receipt.isVoided && (
                    <button
                      type="button"
                      onClick={onVoidPayment}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                    >
                      <Ban
                        className="size-4"
                        aria-hidden="true"
                      />

                      Void Payment
                    </button>
                  )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
