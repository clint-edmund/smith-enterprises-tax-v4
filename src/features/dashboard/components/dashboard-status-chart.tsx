import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { Link } from "react-router-dom";

import type { DashboardStatusMetric } from "@/features/dashboard/types/dashboard.types";
import { formatNumber } from "@/features/dashboard/utils/dashboard-formatters";

type DashboardStatusChartProps = {
  data: DashboardStatusMetric[];
};

export function DashboardStatusChart({ data }: DashboardStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-start gap-3">
        <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
          <ChartNoAxesColumnIncreasing className="size-5" />
        </span>

        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Returns by Status
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Current workflow distribution across all returns.
          </p>
        </div>
      </header>

      {total === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
          No return activity is available yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {data.map((item) => {
            const percentage = (item.count / total) * 100;

            return (
              <Link
                key={item.status}
                to={`/returns?status=${encodeURIComponent(item.status)}`}
                className="block rounded-xl border border-transparent p-2 transition hover:border-blue-200 hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-700">
                    {item.label}
                  </span>
                  <span className="font-bold text-slate-950">
                    {formatNumber(item.count)}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-700"
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
