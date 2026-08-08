import {
  appConfig,
} from "@/config/app-config"
import type {
  PaymentReceiptDetails,
} from "@/features/payments/types/payment.types"

interface PaymentReceiptProps {
  receipt: PaymentReceiptDetails
}

function formatCurrency(
  amount: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  ).format(amount)
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Not available"
  }

  const parsedDate =
    new Date(value)

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  ).format(parsedDate)
}

function formatDateTime(
  value: string | null,
) {
  if (!value) {
    return "Not available"
  }

  const parsedDate =
    new Date(value)

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(parsedDate)
}

function formatPaymentMethod(
  paymentMethod: string,
) {
  return paymentMethod
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    )
}

interface ReceiptDetailProps {
  label: string
  value: string
}

function ReceiptDetail({
  label,
  value,
}: ReceiptDetailProps) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium text-slate-950">
        {value}
      </dd>
    </div>
  )
}

export function PaymentReceipt({
  receipt,
}: PaymentReceiptProps) {
  const receiptNumber =
    receipt.receiptNumber ??
    "Receipt Pending"

  const issuedAt =
    receipt.receiptIssuedAt ??
    receipt.createdAt

  const business =
    appConfig.business

  const contactLines = [
    ...business.addressLines,
    business.phone,
    business.email,
    business.website,
  ].filter(Boolean)

  const statusLabel =
    receipt.isVoided
      ? "VOIDED"
      : "PAID"

  return (
    <article
      className="receipt-print relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none"
    >
      {receipt.isVoided && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center overflow-hidden print:flex"
        >
          <span className="-rotate-45 select-none text-[8rem] font-black tracking-[0.18em] text-red-700/10">
            VOID
          </span>
        </div>
      )}

      <header className="receipt-header relative z-20 border-b border-slate-200 bg-slate-950 px-6 py-7 text-white print:border-b-2 print:border-slate-950 print:bg-white print:text-slate-950">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300 print:text-slate-600">
              {business.name}
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Payment Receipt
            </h1>

            <p className="mt-2 text-sm text-slate-300 print:text-slate-600">
              {business.tagline}
            </p>

            {contactLines.length > 0 && (
              <address className="mt-4 space-y-1 text-xs not-italic leading-5 text-slate-300 print:text-slate-600">
                {contactLines.map(
                  (line) => (
                    <p key={line}>
                      {line}
                    </p>
                  ),
                )}
              </address>
            )}
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${
                receipt.isVoided
                  ? "border-red-300 bg-red-100 text-red-800 print:border-red-700 print:bg-white"
                  : "border-emerald-300 bg-emerald-100 text-emerald-800 print:border-emerald-700 print:bg-white"
              }`}
            >
              {statusLabel}
            </span>

            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 print:border-slate-300 print:bg-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300 print:text-slate-500">
                Receipt Number
              </p>

              <p className="mt-1 font-mono text-sm font-bold">
                {receiptNumber}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-20 space-y-8 px-6 py-7 sm:px-8">
        {receipt.isVoided && (
          <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900 print:border-red-700 print:bg-white">
            <p className="text-sm font-bold uppercase tracking-wide">
              Voided Receipt
            </p>

            <p className="mt-1 text-sm">
              This payment was voided and should not be treated as an active payment.
            </p>

            {receipt.voidReason && (
              <p className="mt-2 text-sm">
                Reason: {receipt.voidReason}
              </p>
            )}

            {receipt.voidedByName && (
              <p className="mt-2 text-sm">
                Voided by: {receipt.voidedByName}
              </p>
            )}

            {receipt.voidedAt && (
              <p className="mt-1 text-sm">
                Voided on: {formatDateTime(
                  receipt.voidedAt,
                )}
              </p>
            )}
          </section>
        )}

        <section className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Current Payment
            </p>

            <p
              className={`mt-1 text-4xl font-bold tracking-tight ${
                receipt.isVoided
                  ? "text-slate-500 line-through"
                  : "text-slate-950"
              }`}
            >
              {formatCurrency(
                receipt.amount,
              )}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm print:bg-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Payment Date
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {formatDate(
                receipt.paymentDate,
              )}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 print:bg-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment Summary
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Payment applied to the listed tax return.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount Received
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {formatCurrency(
                  receipt.amount,
                )}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 print:bg-white">
          <ReceiptDetail
            label="Client"
            value={receipt.clientName}
          />

          <ReceiptDetail
            label="Client Number"
            value={
              receipt.clientNumber !== null
                ? String(
                    receipt.clientNumber,
                  )
                : "Not available"
            }
          />

          <ReceiptDetail
            label="Tax Year"
            value={String(
              receipt.taxYear,
            )}
          />

          <ReceiptDetail
            label="Return Type"
            value={
              receipt.returnType ||
              "Not available"
            }
          />

          <ReceiptDetail
            label="Payment Method"
            value={formatPaymentMethod(
              receipt.paymentMethod,
            )}
          />

          <ReceiptDetail
            label="Reference Number"
            value={
              receipt.referenceNumber ??
              "Not provided"
            }
          />

          <ReceiptDetail
            label="Received By"
            value={
              receipt.createdByName ||
              `${business.name} staff`
            }
          />

          <ReceiptDetail
            label="Receipt Issued By"
            value={
              receipt.receiptIssuedByName ||
              `${business.name} staff`
            }
          />

          <ReceiptDetail
            label="Receipt Issued"
            value={formatDateTime(
              issuedAt,
            )}
          />

          <ReceiptDetail
            label="Payment Status"
            value={statusLabel}
          />
        </section>

        {receipt.notes && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Payment Notes
            </h2>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {receipt.notes}
            </p>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 print:bg-white">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Receipt Audit Information
          </h2>

          <dl className="mt-4 grid gap-6 sm:grid-cols-2">
            <ReceiptDetail
              label="Receipt Number"
              value={
                receipt.receiptNumber ??
                "Pending"
              }
            />

            <ReceiptDetail
              label="Receipt Issued"
              value={formatDateTime(
                receipt.receiptIssuedAt,
              )}
            />

            <ReceiptDetail
              label="Receipt Issued By"
              value={
                receipt.receiptIssuedByName ||
                `${business.name} staff`
              }
            />

            <ReceiptDetail
              label="Recorded By"
              value={
                receipt.createdByName ||
                `${business.name} staff`
              }
            />

            <ReceiptDetail
              label="Created"
              value={formatDateTime(
                receipt.createdAt,
              )}
            />

            <ReceiptDetail
              label="Last Updated"
              value={formatDateTime(
                receipt.updatedAt,
              )}
            />
          </dl>
        </section>

        <section className="grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Received By
            </p>

            <div className="mt-10 border-b border-slate-500" />

            <p className="mt-2 text-xs text-slate-500">
              {business.name} authorized representative
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center print:min-h-28">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Receipt Verification
            </p>

            <div className="mx-auto mt-3 flex size-16 items-center justify-center border border-slate-300 bg-slate-50 font-mono text-[10px] text-slate-400 print:bg-white">
              QR
            </div>

            <p className="mt-2 break-all font-mono text-[10px] text-slate-500">
              {receiptNumber}
            </p>
          </div>
        </section>

        <footer className="receipt-footer border-t border-slate-200 pt-6 text-center">
          <p className="text-sm font-medium text-slate-800">
            Thank you for choosing {business.name}.
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Please retain this receipt for your records.
          </p>

          <p className="mt-4 text-xs text-slate-400">
            This receipt was generated electronically by the {appConfig.name}.
          </p>
        </footer>
      </div>
    </article>
  )
}
