import { CircleDollarSign } from "lucide-react";

import type { DashboardMonthlyFinancial } from "@/features/dashboard/types/dashboard.types";
import { formatCurrency } from "@/features/dashboard/utils/dashboard-formatters";

type DashboardFinancialChartProps = {
  data: DashboardMonthlyFinancial[];
};

function calculateWidth(value: number, maximum: number): string {
  if (maximum <= 0 || value <= 0) {
    return "0%";
  }

  return `${Math.max((value / maximum) * 100, 3)}%`;
}

export function DashboardFinancialChart({
  data,
}: DashboardFinancialChartProps) {
  const maximum = Math.max(
    0,
    ...data.flatMap((item) => [item.fees, item.payments]),
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-start gap-3">
        <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
          <CircleDollarSign className="size-5" />
        </span>

        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Six-Month Financial Performance
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Preparation fees and payments recorded by month.
          </p>
        </div>
      </header>

      {data.length === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
          No financial activity is available for this period.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {data.map((item) => (
            <div key={item.month} className="grid gap-2 sm:grid-cols-[5rem_1fr]">
              <p className="text-sm font-semibold text-slate-700">
                {item.monthLabel}
              </p>

              <div className="space-y-2">
                <div>
                  <div className="mb-1 flex justify-between gap-3 text-xs">
                    <span className="font-medium text-slate-600">Fees</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(item.fees)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-700"
                      style={{ width: calculateWidth(item.fees, maximum) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between gap-3 text-xs">
                    <span className="font-medium text-slate-600">Payments</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(item.payments)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: calculateWidth(item.payments, maximum) }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-blue-700" /> Fees
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-emerald-600" /> Payments
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
