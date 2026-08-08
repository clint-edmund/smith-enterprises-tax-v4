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
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { supabase } from "@/services/supabase";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { DashboardAttentionList } from "@/features/dashboard/components/dashboard-attention-list";
import { DashboardReturnList } from "@/features/dashboard/components/dashboard-return-list";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { ExecutiveKpis } from "@/features/dashboard/components/executive-kpis";
import { MyWorkload } from "@/features/dashboard/components/my-workload";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { QuickReports } from "@/features/dashboard/components/quick-reports";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { StaffWorkload } from "@/features/dashboard/components/staff-workload";
import { SummaryCard } from "@/features/dashboard/components/summary-card";
import { WorkflowOperations } from "@/features/dashboard/components/workflow-operations";
import { DashboardFinancialOverview } from "@/features/dashboard/components/dashboard-financial-overview";
import { getExecutiveFinancialAnalytics } from "@/features/dashboard/services/financial-analytics-service";
import type { ExecutiveFinancialAnalytics } from "@/features/dashboard/types/financial-analytics.types";
import {
  getOfficePaymentSummary,
} from "@/features/payments/services/payment-service";
import type {
  OfficePaymentSummary,
} from "@/features/payments/types/payment.types";
import {
  getDashboardData,
  getRecentDashboardActivity,
  getStaffWorkloadSummary,
} from "@/features/dashboard/services/dashboard-service";
import type {
  DashboardActivity,
} from "@/features/dashboard/types/activity.types";
import type {
  DashboardData,
  DashboardStaffWorkload,
} from "@/features/dashboard/types/dashboard.types";
import {
  formatCurrency,
  formatNumber,
} from "@/features/dashboard/utils/dashboard-formatters";

import {
  useRecentActivityRealtime,
} from "@/features/dashboard/hooks/use-recent-activity-realtime"


import {
  useAuthorization,
} from "@/features/authorization/hooks/use-authorization"

const DashboardFinancialChart =
  lazy(async () => {
    const module =
      await import(
        "@/features/dashboard/components/dashboard-financial-chart"
      )

    return {
      default:
        module.DashboardFinancialChart,
    }
  })

const DashboardStaffWorkloadChart =
  lazy(async () => {
    const module =
      await import(
        "@/features/dashboard/components/dashboard-staff-workload-chart"
      )

    return {
      default:
        module.DashboardStaffWorkloadChart,
    }
  })

const DashboardStatusChart =
  lazy(async () => {
    const module =
      await import(
        "@/features/dashboard/components/dashboard-status-chart"
      )

    return {
      default:
        module.DashboardStatusChart,
    }
  })

const ExecutiveFinancialAnalyticsPanel =
  lazy(async () => {
    const module =
      await import(
        "@/features/dashboard/components/executive-financial-analytics-panel"
      )

    return {
      default:
        module.ExecutiveFinancialAnalyticsPanel,
    }
  })

const ReturnReadinessCenter =
  lazy(async () => {
    const module =
      await import(
        "@/features/dashboard/components/return-readiness-center"
      )

    return {
      default:
        module.ReturnReadinessCenter,
    }
  })

const SmartRecommendationsPanel =
  lazy(async () => {
    const module =
      await import(
        "@/features/dashboard/components/smart-recommendations-panel"
      )

    return {
      default:
        module.SmartRecommendationsPanel,
    }
  })

const PriorityQueueCard =
  lazy(async () => {
    const module =
      await import(
        "@/features/dashboard/components/priority-queue-card"
      )

    return {
      default:
        module.PriorityQueueCard,
    }
  })

const emptyFinancialOverview: OfficePaymentSummary = {
  paymentsToday: 0,
  paymentCountToday: 0,
  paymentsThisMonth: 0,
  paymentCountThisMonth: 0,
  outstandingReceivables: 0,
  returnsWithBalance: 0,
  voidedPaymentsTotal: 0,
  voidedPaymentCount: 0,
};

const emptyExecutiveAnalytics: ExecutiveFinancialAnalytics = {
  periods: {
    todayRevenue: 0,
    todayPaymentCount: 0,
    yesterdayRevenue: 0,
    last7DaysRevenue: 0,
    previous7DaysRevenue: 0,
    last30DaysRevenue: 0,
    yearToDateRevenue: 0,
    averageDailyRevenue: 0,
  },
  collection: {
    totalFees: 0,
    totalCollected: 0,
    outstandingReceivables: 0,
    returnsAwaitingPayment: 0,
    collectionRate: 0,
  },
  paymentMethods: [],
  preparers: [],
  dailySnapshot: {
    returnsCompletedToday: 0,
    paymentsReceivedToday: 0,
    revenueToday: 0,
    returnsAwaitingPayment: 0,
    returnsFiledToday: 0,
    newClientsToday: 0,
  },
  generatedAt: new Date(0).toISOString(),
};

function DashboardPanelFallback() {
  return (
    <div className="min-h-48 animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
      <div className="h-5 w-40 rounded bg-slate-200" />

      <div className="mt-6 space-y-3">
        <div className="h-4 rounded bg-slate-100" />
        <div className="h-4 w-5/6 rounded bg-slate-100" />
        <div className="h-4 w-3/4 rounded bg-slate-100" />
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { profile } = useAuth();
  const {
    hasPermission,
    permissions,
  } = useAuthorization();

  const canViewExecutiveData =
    hasPermission(
      permissions.dashboard
        .viewExecutiveData,
    )

  const realtimeRefreshTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    )

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [staffWorkload, setStaffWorkload] = useState<DashboardStaffWorkload | null>(null);
  const [
    financialOverview,
    setFinancialOverview,
  ] = useState<OfficePaymentSummary>(
    emptyFinancialOverview,
  );
  const [
    financialOverviewError,
    setFinancialOverviewError,
  ] = useState<string | null>(null);
  const [
    executiveAnalytics,
    setExecutiveAnalytics,
  ] = useState<ExecutiveFinancialAnalytics>(
    emptyExecutiveAnalytics,
  );
  const [
    executiveAnalyticsError,
    setExecutiveAnalyticsError,
  ] = useState<string | null>(null);
  const [
    isRefreshingExecutiveAnalytics,
    setIsRefreshingExecutiveAnalytics,
  ] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [isRefreshingActivity, setIsRefreshingActivity] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    setErrorMessage(null);

    try {
      const [
        data,
        workloadData,
        paymentSummary,
      ] = await Promise.all([
        getDashboardData(),
        getStaffWorkloadSummary(),
        getOfficePaymentSummary(),
      ]);

      setDashboardData(data);
      setStaffWorkload(workloadData);
      setFinancialOverview(paymentSummary);
      setFinancialOverviewError(null);
      setActivities(data.activities);

      if (canViewExecutiveData) {
        try {
          const executiveAnalyticsResult =
            await getExecutiveFinancialAnalytics();

          setExecutiveAnalytics(
            executiveAnalyticsResult,
          );
          setExecutiveAnalyticsError(null);
        } catch (analyticsError) {
          console.error(
            "Unable to load executive financial analytics:",
            analyticsError,
          );

          setExecutiveAnalyticsError(
            analyticsError instanceof Error
              ? analyticsError.message
              : "Executive financial analytics could not be loaded.",
          );
        }
      } else {
        setExecutiveAnalytics(
          emptyExecutiveAnalytics,
        );
        setExecutiveAnalyticsError(null);
      }
    } catch (error) {
      console.error("Unable to load dashboard:", error);

      setErrorMessage("Unable to load dashboard data.");
      setFinancialOverviewError(
        "Financial overview could not be loaded.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [canViewExecutiveData]);

  const refreshExecutiveAnalytics =
    useCallback(async () => {
      if (!canViewExecutiveData) {
        return
      }

      setIsRefreshingExecutiveAnalytics(true)
      setExecutiveAnalyticsError(null)

      try {
        const result =
          await getExecutiveFinancialAnalytics()

        setExecutiveAnalytics(result)
      } catch (error) {
        console.error(
          "Unable to refresh executive financial analytics:",
          error,
        )

        setExecutiveAnalyticsError(
          error instanceof Error
            ? error.message
            : "Executive financial analytics could not be refreshed.",
        )
      } finally {
        setIsRefreshingExecutiveAnalytics(false)
      }
    }, [canViewExecutiveData])

      const refreshActivity = useCallback(
      async (
        showRefreshIndicator = true,
      ) => {
        if (showRefreshIndicator) {
          setIsRefreshingActivity(true)
        }

        setActivityError(null)

        try {
          const recentActivity =
            await getRecentDashboardActivity()

          setActivities(recentActivity)
        } catch (error) {
          console.error(
            "Unable to refresh recent activity:",
            error,
          )

          setActivityError(
            "Unable to refresh recent activity.",
          )
        } finally {
          if (showRefreshIndicator) {
            setIsRefreshingActivity(false)
          }
        }
      },
      [],
    )

    const refreshActivitySilently =
      useCallback(() => {
        void refreshActivity(false)
      }, [refreshActivity])

    useEffect(() => {
      void loadDashboard()
    }, [loadDashboard])

  useEffect(() => {
    const scheduleDashboardRefresh = () => {
      if (
        realtimeRefreshTimerRef.current
      ) {
        clearTimeout(
          realtimeRefreshTimerRef.current,
        )
      }

      realtimeRefreshTimerRef.current =
        setTimeout(() => {
          realtimeRefreshTimerRef.current =
            null

          void loadDashboard(false)
        }, 350)
    }

    const dashboardChannel =
      supabase
        .channel(
          "dashboard-realtime-changes",
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "audit_logs",
          },
          scheduleDashboardRefresh,
        )
        .subscribe((status, error) => {
          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
          ) {
            console.error(
              "Dashboard realtime subscription failed:",
              status,
              error,
            )
          }
        })

    return () => {
      if (
        realtimeRefreshTimerRef.current
      ) {
        clearTimeout(
          realtimeRefreshTimerRef.current,
        )

        realtimeRefreshTimerRef.current =
          null
      }

      void supabase.removeChannel(
        dashboardChannel,
      )
    }
  }, [loadDashboard])

  const {
    realtimeStatus,
  } = useRecentActivityRealtime({
    enabled: Boolean(profile),
    onActivityInserted:
      refreshActivitySilently,
  })

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return null;
  }

  if (
  errorMessage ||
  !dashboardData ||
  !staffWorkload
) {
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

  const {
  summary,
  executive,
  workload,
  readiness,
  recentReturns,
  attentionItems,
  analytics,
  loadedAt,
} = dashboardData

  const staffName =
    profile.firstName ||
    profile.displayName ||
    "Staff Member";

  const canViewReturnReadiness =
    hasPermission(
      permissions.dashboard
        .viewReturnReadiness,
    )

  const canViewPriorityQueue =
    hasPermission(
      permissions.dashboard
        .viewPriorityQueue,
    )

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

          <p className="mt-3 text-xs text-slate-400">
            Last updated {new Date(loadedAt).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
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
          href="/returns"
        />

        <SummaryCard
          label="In Progress"
          value={formatNumber(summary.inProgressReturns)}
          description="Returns actively being prepared"
          icon={FileClock}
          href="/returns?status=in_progress"
        />

        <SummaryCard
          label="Awaiting Review"
          value={formatNumber(summary.awaitingReviewReturns)}
          description="Ready-for-review and under-review returns"
          icon={ScanSearch}
          href="/returns?status=ready_for_review"
        />

        <SummaryCard
          label="Upcoming Deadlines"
          value={formatNumber(summary.upcomingDeadlines)}
          description={`${formatNumber(
            summary.overdueReturns,
          )} overdue returns`}
          icon={CalendarClock}
          href="/returns?deadline=next_7_days"
        />

        <SummaryCard
          label="Documents Pending"
          value={formatNumber(summary.documentsPending)}
          description="Returns awaiting client documents"
          icon={AlertTriangle}
          href="/returns?status=documents_pending"
        />

        {canViewExecutiveData && (
          <SummaryCard
            label="Net Preparation Fees"
            value={formatCurrency(summary.totalFees)}
            description={`${formatCurrency(
              summary.totalPayments,
            )} in recorded payments`}
            icon={CircleDollarSign}
          />
        )}

        <SummaryCard
          label="Completed Returns"
          value={formatNumber(summary.completedReturns)}
          description={`${formatNumber(
            summary.unassignedReturns,
          )} open returns are unassigned`}
          icon={FileCheck2}
          href="/returns?status=completed"
        />
      </div>

      {canViewExecutiveData && (
        <DashboardFinancialOverview
          summary={financialOverview}
          errorMessage={financialOverviewError}
          onRefresh={() => {
            void loadDashboard(true);
          }}
        />
      )}

      {canViewExecutiveData && (
        <Suspense
          fallback={
            <DashboardPanelFallback />
          }
        >
          <ExecutiveFinancialAnalyticsPanel
            analytics={executiveAnalytics}
            errorMessage={executiveAnalyticsError}
            isRefreshing={
              isRefreshingExecutiveAnalytics
            }
            onRefresh={() => {
              void refreshExecutiveAnalytics()
            }}
          />
        </Suspense>
      )}

      {canViewReturnReadiness && (
        <Suspense
          fallback={
            <DashboardPanelFallback />
          }
        >
          <ReturnReadinessCenter
            metrics={readiness}
          />
        </Suspense>
      )}

      {canViewExecutiveData && (
        <>
          <ExecutiveKpis
            metrics={executive}
          />

          <Suspense
            fallback={
              <DashboardPanelFallback />
            }
          >
            <SmartRecommendationsPanel
              recommendations={
                dashboardData.recommendations
              }
            />
          </Suspense>
        </>
      )}

      {canViewPriorityQueue && (
        <Suspense
          fallback={
            <DashboardPanelFallback />
          }
        >
          <PriorityQueueCard
            items={dashboardData.priorityQueue}
            onPriorityItemUpdated={() => {
              void loadDashboard(true)
            }}
          />
        </Suspense>
      )}

      {canViewExecutiveData && (
        <>
          <WorkflowOperations
            workflow={summary.workflow}
          />

          <StaffWorkload
            workload={staffWorkload}
          />
        </>
      )}

      <MyWorkload workload={workload} />

      {canViewExecutiveData ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Suspense
            fallback={
              <DashboardPanelFallback />
            }
          >
            <DashboardFinancialChart
              data={analytics.monthlyFinancials}
            />
          </Suspense>

          <Suspense
            fallback={
              <DashboardPanelFallback />
            }
          >
            <DashboardStatusChart
              data={analytics.statusMetrics}
            />
          </Suspense>
        </div>
      ) : (
        <Suspense
          fallback={
            <DashboardPanelFallback />
          }
        >
          <DashboardStatusChart
            data={analytics.statusMetrics}
          />
        </Suspense>
      )}

      {canViewExecutiveData && (
        <Suspense
          fallback={
            <DashboardPanelFallback />
          }
        >
          <DashboardStaffWorkloadChart
            data={analytics.staffWorkload}
          />
        </Suspense>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardReturnList returns={recentReturns} />

        <DashboardAttentionList items={attentionItems} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentActivity
            activities={activities}
            errorMessage={activityError}
            isRefreshing={isRefreshingActivity}
            onRefresh={() => {
              void refreshActivity()
            }}
            realtimeStatus={realtimeStatus}
          />
        </div>

        <div className="space-y-6">
          <QuickActions role={profile.role} />

          {canViewExecutiveData && (
            <QuickReports />
          )}
        </div>
      </div>
    </section>
  );
}
