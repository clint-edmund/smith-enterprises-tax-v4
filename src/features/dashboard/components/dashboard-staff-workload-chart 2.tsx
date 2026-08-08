import { UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import type { DashboardStaffWorkloadMetric } from "@/features/dashboard/types/dashboard.types";
import { formatNumber } from "@/features/dashboard/utils/dashboard-formatters";

type DashboardStaffWorkloadChartProps = {
  data: DashboardStaffWorkloadMetric[];
};

export function DashboardStaffWorkloadChart({
  data,
}: DashboardStaffWorkloadChartProps) {
  const maximum = Math.max(0, ...data.map((item) => item.assignedReturns));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-start gap-3">
        <span className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
          <UsersRound className="size-5" />
        </span>

        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Staff Workload
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Open assignments, overdue work, and reviews by staff member.
          </p>
        </div>
      </header>

      {data.length === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
          No assigned staff workload is available.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {data.map((item) => (
            <div key={item.staffId ?? item.staffName}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {item.staffName}
                </p>

                <div className="flex gap-3 text-xs text-slate-600">
                  <span>{formatNumber(item.assignedReturns)} open</span>
                  <span className={item.overdueReturns > 0 ? "font-bold text-red-700" : ""}>
                    {formatNumber(item.overdueReturns)} overdue
                  </span>
                  <span>{formatNumber(item.awaitingReviewReturns)} reviews</span>
                </div>
              </div>

              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-violet-700"
                  style={{
                    width:
                      maximum > 0
                        ? `${Math.max((item.assignedReturns / maximum) * 100, 3)}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          ))}

          <Link
            to="/returns?assignment=unassigned"
            className="inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            Review unassigned returns
          </Link>
        </div>
      )}
    </section>
  );
}
