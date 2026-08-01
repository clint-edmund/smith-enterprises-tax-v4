import {
  Ban,
  CalendarDays,
  CircleDollarSign,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";

import type {
  OfficePaymentSummary,
} from "@/features/payments/types/payment.types";
import {
  formatPaymentAmount,
} from "@/features/payments/utils/payment-formatters";

interface DashboardFinancialOverviewProps {
  summary: OfficePaymentSummary;
  errorMessage: string | null;
  onRefresh: () => void;
}

interface FinancialMetricProps {
  label: string;
  value: string;
  detail: string;
  icon: typeof CircleDollarSign;
}

function FinancialMetric({
  label,
  value,
  detail,
  icon: Icon,
}: FinancialMetricProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {detail}
          </p>
        </div>

        <span className="rounded-lg bg-white p-2.5 text-blue-700 shadow-sm">
          <Icon
            className="size-5"
            aria-hidden="true"
          />
        </span>
      </div>
    </article>
  );
}

export function DashboardFinancialOverview({
  summary,
  errorMessage,
  onRefresh,
}: DashboardFinancialOverviewProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
            <CircleDollarSign
              className="size-5"
              aria-hidden="true"
            />
          </span>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Financial Overview
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Monitor current collections, outstanding receivables,
              and voided-payment activity.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw
              className="size-4"
              aria-hidden="true"
            />

            Refresh
          </button>

          <Link
            to="/payments"
            className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Open Payments
          </Link>
        </div>
      </header>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-900">
            Financial overview unavailable
          </p>

          <p className="mt-1 text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FinancialMetric
            label="Payments Today"
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

          <FinancialMetric
            label="Payments This Month"
            value={formatPaymentAmount(
              summary.paymentsThisMonth,
            )}
            detail={`${summary.paymentCountThisMonth} ${
              summary.paymentCountThisMonth === 1
                ? "payment"
                : "payments"
            } recorded this month`}
            icon={CalendarDays}
          />

          <FinancialMetric
            label="Outstanding Receivables"
            value={formatPaymentAmount(
              summary.outstandingReceivables,
            )}
            detail={`${summary.returnsWithBalance} ${
              summary.returnsWithBalance === 1
                ? "return has"
                : "returns have"
            } an unpaid balance`}
            icon={WalletCards}
          />

          <FinancialMetric
            label="Voided Payments"
            value={formatPaymentAmount(
              summary.voidedPaymentsTotal,
            )}
            detail={`${summary.voidedPaymentCount} ${
              summary.voidedPaymentCount === 1
                ? "voided transaction"
                : "voided transactions"
            } in the reporting period`}
            icon={Ban}
          />
        </div>
      )}
    </section>
  );
}
