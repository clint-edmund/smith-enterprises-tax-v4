import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  FileCheck2,
  FileClock,
  Files,
  RefreshCw,
  ScanSearch,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { DashboardAttentionList } from "@/features/dashboard/components/dashboard-attention-list";
import { DashboardReturnList } from "@/features/dashboard/components/dashboard-return-list";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { SummaryCard } from "@/features/dashboard/components/summary-card";
import { getDashboardData } from "@/features/dashboard/services/dashboard-service";
import type { DashboardData } from "@/features/dashboard/types/dashboard.types.ts";
import {
  formatCurrency,
  formatNumber,
} from "@/features/dashboard/utils/dashboard-formatters";

export function DashboardPage() {
  const { profile } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    setErrorMessage(null);

    try {
      const data = await getDashboardData();

      setDashboardData(data);
    } catch (error) {
      console.error("Unable to load dashboard:", error);

      setErrorMessage("Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadDashboard]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return null;
  }

  if (errorMessage || !dashboardData) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
          Dashboard Error
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Dashboard information could not be loaded
        </h1>

        <p className="mt-3 text-slate-600">
          {errorMessage ?? "An unexpected error occurred."}
        </p>

        <button
          type="button"
          onClick={() => {
            void loadDashboard();
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800"
        >
          <RefreshCw className="size-4" />
          Try Again
        </button>
      </section>
    );
  }

  const { summary, activities, recentReturns, attentionItems } = dashboardData;

  const staffName = profile.firstName || profile.displayName || "Staff Member";

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
            Operational Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome, {staffName}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Monitor clients, return workflow, deadlines, assignments, and
            financial activity from live application data.
          </p>
        </div>

        <button
          type="button"
          disabled={isRefreshing}
          onClick={() => {
            void loadDashboard(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />

          {isRefreshing ? "Refreshing" : "Refresh"}
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Active Clients"
          value={formatNumber(summary.activeClients)}
          description="Client records currently marked active"
          icon={Users}
        />

        <SummaryCard
          label="Total Returns"
          value={formatNumber(summary.totalReturns)}
          description={`${formatNumber(summary.openReturns)} currently open`}
          icon={Files}
        />

        <SummaryCard
          label="In Progress"
          value={formatNumber(summary.inProgressReturns)}
          description="Returns actively being prepared"
          icon={FileClock}
        />

        <SummaryCard
          label="Awaiting Review"
          value={formatNumber(summary.awaitingReviewReturns)}
          description="Ready-for-review and under-review returns"
          icon={ScanSearch}
        />

        <SummaryCard
          label="Upcoming Deadlines"
          value={formatNumber(summary.upcomingDeadlines)}
          description={`${formatNumber(
            summary.overdueReturns,
          )} overdue returns`}
          icon={CalendarClock}
        />

        <SummaryCard
          label="Documents Pending"
          value={formatNumber(summary.documentsPending)}
          description="Returns awaiting client documents"
          icon={AlertTriangle}
        />

        <SummaryCard
          label="Net Preparation Fees"
          value={formatCurrency(summary.totalFees)}
          description={`${formatCurrency(
            summary.totalPayments,
          )} in recorded payments`}
          icon={CircleDollarSign}
        />

        <SummaryCard
          label="Completed Returns"
          value={formatNumber(summary.completedReturns)}
          description={`${formatNumber(
            summary.unassignedReturns,
          )} open returns are unassigned`}
          icon={FileCheck2}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardReturnList returns={recentReturns} />

        <DashboardAttentionList items={attentionItems} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <RecentActivity activities={activities} />

        <QuickActions role={profile.role} />
      </div>
    </section>
  );
}
