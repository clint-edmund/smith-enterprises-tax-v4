import {
  Ban,
  CalendarDays,
  CircleDollarSign,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Link,
} from "react-router-dom"

import {
  useAuth,
} from "@/features/auth/hooks/use-auth"
import {
  getClientDetailsRoute,
} from "@/config/app-config"
import {
  getOfficePaymentSummary,
  getRecentOfficePayments,
  getPaymentReceipt,
  updateReturnPayment,
} from "@/features/payments/services/payment-service"
import type {
  OfficePaymentRecord,
  OfficePaymentSummary,
  PaymentReceiptDetails,
} from "@/features/payments/types/payment.types"
import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentMethodLabels,
} from "@/features/payments/utils/payment-formatters"
import {
  PaymentActionsMenu,
} from "@/features/payments/components/payment-actions-menu"
import {
  PaymentDetailsDialog,
} from "@/features/payments/components/payment-details-dialog"
import {
  RecordPaymentDialog,
} from "@/features/payments/components/record-payment-dialog"
import {
  OfficeVoidPaymentDialog,
} from "@/features/payments/components/office-void-payment-dialog"
import {
  PaymentEditDialog,
} from "@/features/payments/components/payment-edit-dialog"
import type {
  EditPaymentValues,
} from "@/features/payments/components/payment-edit-dialog"

const emptySummary: OfficePaymentSummary = {
  paymentsToday: 0,
  paymentCountToday: 0,
  paymentsThisMonth: 0,
  paymentCountThisMonth: 0,
  outstandingReceivables: 0,
  returnsWithBalance: 0,
  voidedPaymentsTotal: 0,
  voidedPaymentCount: 0,
}

interface SummaryCardProps {
  title: string
  value: string
  detail: string
  icon: typeof CircleDollarSign
}

function SummaryCard({
  title,
  value,
  detail,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {detail}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3">
          <Icon
            className="size-5 text-blue-700"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  )
}

export function PaymentsPage() {
  const { profile } = useAuth()

  const canVoidPayments =
    profile?.role === "administrator" ||
    profile?.role === "manager"

  const [
    summary,
    setSummary,
  ] = useState<OfficePaymentSummary>(
    emptySummary,
  )

  const [
    payments,
    setPayments,
  ] = useState<OfficePaymentRecord[]>([])

  const [
    searchText,
    setSearchText,
  ] = useState("")

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  const [
    selectedReceipt,
    setSelectedReceipt,
  ] =
    useState<PaymentReceiptDetails | null>(
      null,
    )

  const [
    isReceiptOpen,
    setIsReceiptOpen,
  ] =
    useState(false)

  const [
    isLoadingReceipt,
    setIsLoadingReceipt,
  ] =
    useState(false)

  const [
    paymentForRecording,
    setPaymentForRecording,
  ] = useState<OfficePaymentRecord | null>(
    null,
  )

  const [
    paymentForVoiding,
    setPaymentForVoiding,
  ] = useState<OfficePaymentRecord | null>(
    null,
  )

  const [
    paymentForEditing,
    setPaymentForEditing,
  ] = useState<PaymentReceiptDetails | null>(
    null,
  )

  const [
    isSavingPayment,
    setIsSavingPayment,
  ] = useState(false)

  const handleViewReceipt =
  useCallback(
    async (
      payment: OfficePaymentRecord,
    ) => {
      try {
        setIsLoadingReceipt(true)

        const receipt =
          await getPaymentReceipt(
            payment.paymentId,
          )

        setSelectedReceipt(receipt)
        setIsReceiptOpen(true)
      } catch (error) {
        console.error(error)

        window.alert(
          "Unable to load the payment receipt.",
        )
      } finally {
        setIsLoadingReceipt(false)
      }
    },
    [],
  )
  const handlePrintReceipt =
    useCallback(
      async (
        payment: OfficePaymentRecord,
      ) => {
        try {
          setIsLoadingReceipt(true)

          const receipt =
            await getPaymentReceipt(
              payment.paymentId,
            )

          setSelectedReceipt(receipt)
          setIsReceiptOpen(true)

          window.setTimeout(() => {
            window.print()
          }, 250)
        } catch (error) {
          console.error(
            "Unable to print receipt:",
            error,
          )

          window.alert(
            "Unable to load the payment receipt.",
          )
        } finally {
          setIsLoadingReceipt(false)
        }
      },
      [],
    )

  const handleEditPayment =
    useCallback(
      async (
        payment: OfficePaymentRecord,
      ) => {
        try {
          setIsLoadingReceipt(true)

          const receipt =
            await getPaymentReceipt(
              payment.paymentId,
            )

          setPaymentForEditing(receipt)
        } catch (error) {
          console.error(
            "Unable to load payment for editing:",
            error,
          )

          window.alert(
            "Unable to load the selected payment for editing.",
          )
        } finally {
          setIsLoadingReceipt(false)
        }
      },
      [],
    )

  const loadPayments = useCallback(
    async (
      showRefreshing = false,
    ) => {
      if (showRefreshing) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setErrorMessage(null)

      try {
        const [
          summaryResult,
          paymentResults,
        ] = await Promise.all([
          getOfficePaymentSummary(),
          getRecentOfficePayments(25),
        ])

        setSummary(summaryResult)
        setPayments(paymentResults)
      } catch (error) {
        console.error(
          "Unable to load the payments dashboard:",
          error,
        )

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load payment information.",
        )
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [],
  )

  const handlePaymentRecorded =
    useCallback(
      async (
        paymentId: string,
      ) => {
        setPaymentForRecording(null)

        await loadPayments(true)

        try {
          setIsLoadingReceipt(true)

          const receipt =
            await getPaymentReceipt(
              paymentId,
            )

          setSelectedReceipt(receipt)
          setIsReceiptOpen(true)
        } catch (error) {
          console.error(
            "Payment recorded, but the receipt could not be loaded:",
            error,
          )

          window.alert(
            "The payment was recorded, but its receipt could not be loaded.",
          )
        } finally {
          setIsLoadingReceipt(false)
        }
      },
      [loadPayments],
    )

  const handlePaymentUpdated =
    useCallback(
      async (
        values: EditPaymentValues,
      ) => {
        try {
          setIsSavingPayment(true)

          const result =
            await updateReturnPayment(values)

          setPaymentForEditing(null)
          await loadPayments(true)

          const refreshedReceipt =
            await getPaymentReceipt(
              result.payment.id,
            )

          setSelectedReceipt(
            refreshedReceipt,
          )
          setIsReceiptOpen(true)
        } catch (error) {
          console.error(
            "Unable to update payment:",
            error,
          )

          window.alert(
            error instanceof Error
              ? error.message
              : "Unable to update the payment.",
          )
        } finally {
          setIsSavingPayment(false)
        }
      },
      [loadPayments],
    )

  const handlePaymentVoided =
    useCallback(
      async (
        paymentId: string,
      ) => {
        setPaymentForVoiding(null)

        await loadPayments(true)

        if (
          selectedReceipt?.paymentId ===
          paymentId
        ) {
          try {
            setIsLoadingReceipt(true)

            const receipt =
              await getPaymentReceipt(
                paymentId,
              )

            setSelectedReceipt(receipt)
          } catch (error) {
            console.error(
              "Payment voided, but the receipt could not be refreshed:",
              error,
            )

            setIsReceiptOpen(false)
            setSelectedReceipt(null)
          } finally {
            setIsLoadingReceipt(false)
          }
        }
      },
      [
        loadPayments,
        selectedReceipt,
      ],
    )

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadPayments()
      }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadPayments])

  const filteredPayments =
    useMemo(() => {
      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase()

      if (!normalizedSearch) {
        return payments
      }

      return payments.filter(
        (payment) => {
          const searchableValues = [
            payment.clientName,
            payment.clientNumber?.toString(),
            payment.taxYear.toString(),
            payment.taxForm,
            payment.returnType,
            payment.receiptNumber,
            payment.referenceNumber,
            payment.createdByName,
            paymentMethodLabels[
              payment.paymentMethod
            ],
          ]

          return searchableValues.some(
            (value) =>
              value
                ?.toLowerCase()
                .includes(
                  normalizedSearch,
                ),
          )
        },
      )
    }, [
      payments,
      searchText,
    ])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    )
  }

  return (
    <>
    <section className="space-y-6">
      <header className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
              Financial Management
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Payments
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Review office-wide collections,
              outstanding receivables, recent
              payments, receipts, and voided
              transactions.
            </p>
          </div>

          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => {
              void loadPayments(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
      </header>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <p className="font-semibold text-red-900">
            Unable to load the Payments dashboard
          </p>

          <p className="mt-2 text-sm text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => {
              void loadPayments(true)
            }}
            className="mt-4 text-sm font-semibold text-red-800 underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Payments Today"
          value={formatPaymentAmount(
            summary.paymentsToday,
          )}
          detail={`${summary.paymentCountToday} ${
            summary.paymentCountToday === 1
              ? "payment"
              : "payments"
          } received today`}
          icon={CircleDollarSign}
        />

        <SummaryCard
          title="Payments This Month"
          value={formatPaymentAmount(
            summary.paymentsThisMonth,
          )}
          detail={`${summary.paymentCountThisMonth} ${
            summary.paymentCountThisMonth === 1
              ? "payment"
              : "payments"
          } this month`}
          icon={CalendarDays}
        />

        <SummaryCard
          title="Outstanding Receivables"
          value={formatPaymentAmount(
            summary.outstandingReceivables,
          )}
          detail={`${summary.returnsWithBalance} ${
            summary.returnsWithBalance === 1
              ? "return has"
              : "returns have"
          } an outstanding balance`}
          icon={WalletCards}
        />

        <SummaryCard
          title="Voided Payments"
          value={formatPaymentAmount(
            summary.voidedPaymentsTotal,
          )}
          detail={`${summary.voidedPaymentCount} ${
            summary.voidedPaymentCount === 1
              ? "voided transaction"
              : "voided transactions"
          }`}
          icon={Ban}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Recent Payments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing the 25 most recent office
                payment transactions.
              </p>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-3 size-5 text-slate-400"
                aria-hidden="true"
              />

              <input
                type="search"
                value={searchText}
                onChange={(event) => {
                  setSearchText(
                    event.target.value,
                  )
                }}
                placeholder="Search client, receipt, reference, tax year..."
                aria-label="Search recent payments"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-10 text-center">
            <CircleDollarSign
              className="mx-auto size-10 text-slate-300"
              aria-hidden="true"
            />

            <h3 className="mt-4 font-semibold text-slate-950">
              {payments.length === 0
                ? "No payments have been recorded"
                : "No matching payments found"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {payments.length === 0
                ? "Payments recorded from individual return workspaces will appear here."
                : "Try changing or clearing your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Client
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Return
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Payment
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Receipt
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPayments.map(
                  (payment) => (
                    <tr
                      key={payment.paymentId}
                      className="align-top hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <Link
                          to={getClientDetailsRoute(
                            payment.clientId,
                          )}
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          {payment.clientName}
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          Client #
                          {payment.clientNumber ??
                            "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {payment.taxYear}{" "}
                          {payment.taxForm}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {payment.returnType}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p
                          className={`font-bold ${
                            payment.isVoided
                              ? "text-slate-500 line-through"
                              : "text-slate-950"
                          }`}
                        >
                          {formatPaymentAmount(
                            payment.amount,
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            paymentMethodLabels[
                              payment.paymentMethod
                            ]
                          }
                          {" · "}
                          {formatPaymentDate(
                            payment.paymentDate,
                          )}
                        </p>

                        {payment.referenceNumber && (
                          <p className="mt-1 text-xs text-slate-500">
                            Ref:{" "}
                            {
                              payment.referenceNumber
                            }
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="text-sm font-medium text-slate-900">
                          {payment.receiptNumber
                            ? `#${payment.receiptNumber}`
                            : "Not issued"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Recorded by{" "}
                          {payment.createdByName}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {payment.isVoided ? (
                          <div>
                            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
                              Voided
                            </span>

                            {payment.voidReason && (
                              <p className="mt-2 max-w-xs whitespace-normal text-xs leading-5 text-red-700">
                                {
                                  payment.voidReason
                                }
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            Completed
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <PaymentActionsMenu
                          payment={payment}
                          canVoidPayment={canVoidPayments}
                          onViewReceipt={(selectedPayment) => {
                            void handleViewReceipt(
                              selectedPayment,
                            )
                          }}
                          onPrintReceipt={(selectedPayment) => {
                            void handlePrintReceipt(
                              selectedPayment,
                            )
                          }}
                          onRecordPayment={(selectedPayment) => {
                            setPaymentForRecording(
                              selectedPayment,
                            )
                          }}
                          onEditPayment={(selectedPayment) => {
                            void handleEditPayment(
                              selectedPayment,
                            )
                          }}
                          onVoidPayment={(selectedPayment) => {
                            setPaymentForVoiding(
                              selectedPayment,
                            )
                          }}
                        />
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

        <footer className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          Showing {filteredPayments.length} of{" "}
          {payments.length} recent payment{" "}
          {payments.length === 1
            ? "record"
            : "records"}
          .
        </footer>
            </section>
    </section>

    {paymentForRecording && (
      <RecordPaymentDialog
        payment={paymentForRecording}
        onClose={() => {
          setPaymentForRecording(null)
        }}
        onPaymentRecorded={handlePaymentRecorded}
      />
    )}

    {paymentForEditing && (
      <PaymentEditDialog
        payment={paymentForEditing}
        isSaving={isSavingPayment}
        onClose={() => {
          if (!isSavingPayment) {
            setPaymentForEditing(null)
          }
        }}
        onSave={handlePaymentUpdated}
      />
    )}

    {paymentForVoiding && (
      <OfficeVoidPaymentDialog
        payment={paymentForVoiding}
        onClose={() => {
          setPaymentForVoiding(null)
        }}
        onPaymentVoided={handlePaymentVoided}
      />
    )}

    {isReceiptOpen && selectedReceipt && (
      <PaymentDetailsDialog
        receipt={selectedReceipt}
        canVoidPayment={canVoidPayments}
        onClose={() => {
          setIsReceiptOpen(false)
          setSelectedReceipt(null)
        }}
        onPrintReceipt={() => {
          window.print()
        }}
        onRecordPayment={() => {
          const selectedPayment =
            payments.find(
              (payment) =>
                payment.paymentId ===
                selectedReceipt.paymentId,
            )

          if (!selectedPayment) {
            window.alert(
              "The selected payment could not be found.",
            )

            return
          }

          setIsReceiptOpen(false)
          setSelectedReceipt(null)
          setPaymentForRecording(
            selectedPayment,
          )
        }}
        onVoidPayment={() => {
          const selectedPayment =
            payments.find(
              (payment) =>
                payment.paymentId ===
                selectedReceipt.paymentId,
            )

          if (!selectedPayment) {
            window.alert(
              "The selected payment could not be found.",
            )

            return
          }

          setIsReceiptOpen(false)
          setSelectedReceipt(null)
          setPaymentForVoiding(
            selectedPayment,
          )
        }}
      />
    )}

    {isLoadingReceipt && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50">
        <div
          role="status"
          className="rounded-xl bg-white px-6 py-5 font-semibold text-slate-900 shadow-xl"
        >
          Loading receipt...
        </div>
      </div>
    )}
  </>
)
}