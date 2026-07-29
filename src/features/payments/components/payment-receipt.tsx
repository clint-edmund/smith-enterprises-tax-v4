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

  return (
    <article
      className="
        mx-auto
        w-full
        max-w-3xl
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm

        print:max-w-none
        print:rounded-none
        print:border-0
        print:shadow-none
      "
    >
      <header
        className="
          border-b
          border-slate-200
          bg-slate-950
          px-6
          py-7
          text-white

          print:border-b-2
          print:border-slate-950
          print:bg-white
          print:text-slate-950
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300 print:text-slate-600">
              Smith Enterprises
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Payment Receipt
            </h1>

            <p className="mt-2 text-sm text-slate-300 print:text-slate-600">
              Tax preparation and client services
            </p>
          </div>

          <div
            className="
              rounded-xl
              border
              border-white/20
              bg-white/10
              px-4
              py-3

              print:border-slate-300
              print:bg-white
            "
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300 print:text-slate-500">
              Receipt Number
            </p>

            <p className="mt-1 font-mono text-sm font-bold">
              {receiptNumber}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-8 px-6 py-7 sm:px-8">

                {receipt.isVoided && (
          <section
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-red-900

              print:border-red-700
              print:bg-white
            "
          >
            <p className="text-sm font-bold uppercase tracking-wide">
              Voided Receipt
            </p>

            <p className="mt-1 text-sm">
              This payment was voided and should not be
              treated as an active payment.
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
                Voided on:{" "}
                {formatDateTime(
                  receipt.voidedAt,
                )}
              </p>
            )}
          </section>
        )}

        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Amount Received
              </p>

              <p className="mt-1 text-4xl font-bold tracking-tight text-slate-950">
                {formatCurrency(
                  receipt.amount,
                )}
              </p>
            </div>

            <p className="text-sm text-slate-500">
              Paid on{" "}
              <span className="font-semibold text-slate-800">
                {formatDate(
                  receipt.paymentDate,
                )}
              </span>
            </p>
          </div>
        </section>

        <section
          className="
            grid
            gap-6
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            p-5
            sm:grid-cols-2

            print:bg-white
          "
        >
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
              "Smith Enterprises staff"
            }
          />

          <ReceiptDetail
            label="Receipt Issued By"
            value={
              receipt.receiptIssuedByName ||
              "Smith Enterprises staff"
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
            value={
              receipt.isVoided
                ? "Voided"
                : "Active"
            }
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

                <section
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-5

                    print:bg-white
                  "
                >
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
                        "Smith Enterprises staff"
                      }
                    />

                    <ReceiptDetail
                      label="Recorded By"
                      value={
                        receipt.createdByName ||
                        "Smith Enterprises staff"
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

                <footer className="border-t border-slate-200 pt-6 text-center">
                  <p className="text-sm font-medium text-slate-800">
                    Thank you for choosing Smith Enterprises.
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Please retain this receipt for your records.
                  </p>

                  <p className="mt-4 text-xs text-slate-400">
                    This receipt was generated electronically by the
                    Smith Enterprises Tax Management System.
                  </p>
                </footer>
      </div>
    </article>
  )
}
