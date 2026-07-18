import { supabase } from "@/services/supabase";
import type {
  DashboardActivity,
  DashboardAttentionItem,
  DashboardAnalytics,
  DashboardData,
  DashboardReturnItem,
  DashboardSummary,
  DashboardWorkload,
} from "@/features/dashboard/types/dashboard.types.ts";
import type { PostgrestError } from "@supabase/supabase-js";
import type {
  ReturnStatus,
  ReturnType,
  TaxFormType,
} from "@/features/returns/types/return.types";

import type {
  DashboardStaffWorkload,
  DashboardStaffWorkloadItem,
} from "@/features/dashboard/types/dashboard.types"





type DashboardMonthlyFinancialRpcRow = {
  month_start: string;
  month_label: string;
  fees: number | string | null;
  payments: number | string | null;
  outstanding: number | string | null;
};

type DashboardStatusMetricRpcRow = {
  status: ReturnStatus;
  status_label: string;
  return_count: number | string | null;
};

type DashboardStaffWorkloadRpcRow = {
  staff_id: string | null;
  staff_name: string;
  assigned_returns: number | string | null;
  overdue_returns: number | string | null;
  awaiting_review_returns: number | string | null;
};

type DashboardAnalyticsRpcResult<T> = {
  data: T[] | null;
  error: PostgrestError | null;
};

async function callDashboardAnalyticsRpc<T>(
  functionName: string,
): Promise<DashboardAnalyticsRpcResult<T>> {
  const rpc = supabase.rpc.bind(supabase) as unknown as (
    name: string,
  ) => PromiseLike<DashboardAnalyticsRpcResult<T>>;

  return rpc(functionName);
}

type DashboardWorkloadRpcRow = {
  assigned_to_me: number | string | null;
  review_assigned_to_me: number | string | null;
  due_today: number | string | null;
  due_this_week: number | string | null;
  overdue: number | string | null;
};

type DashboardWorkloadRpcResult = {
  data: DashboardWorkloadRpcRow[] | null;
  error: PostgrestError | null;
};

async function getDashboardWorkloadRpc(): Promise<DashboardWorkloadRpcResult> {
  const rpc = supabase.rpc.bind(supabase) as unknown as (
    functionName: string,
  ) => PromiseLike<DashboardWorkloadRpcResult>;

  return rpc("get_dashboard_my_workload");
}

export async function getStaffWorkloadSummary(): Promise<DashboardStaffWorkload> {
  const { data, error } = await supabase.rpc(
    "get_staff_workload_summary"
  )

  if (error) {
    throw new Error(
      `Unable to load staff workload: ${error.message}`
    )
  }

  const staff = (data ?? []).map(mapStaffWorkloadItem)

  return {
    staff,
    totalAssignedPreparation: staff.reduce(
      (total, item) =>
        total + item.assignedPreparation,
      0
    ),
    totalAssignedReview: staff.reduce(
      (total, item) =>
        total + item.assignedReview,
      0
    ),
    totalOverdue: staff.reduce(
      (total, item) => total + item.overdue,
      0
    ),
    totalOnHold: staff.reduce(
      (total, item) => total + item.onHold,
      0
    ),
  }
}

function convertToNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const convertedValue = Number(value);

  return Number.isFinite(convertedValue) ? convertedValue : 0;
}

function mapReturnItem(item: Record<string, unknown>): DashboardReturnItem {
  return {
    id: String(item.id),
    clientId: String(item.client_id),
    clientNumber: convertToNumber(item.client_number as number | string | null),
    clientName: String(item.client_name ?? "Unknown Client"),
    taxYear: convertToNumber(item.tax_year as number | string | null),
    returnType: item.return_type as ReturnType,
    taxForm: item.tax_form as TaxFormType,
    status: item.status as ReturnStatus,
    assignedPreparerName:
      typeof item.assigned_preparer_name === "string"
        ? item.assigned_preparer_name
        : null,
    dueDate: typeof item.due_date === "string" ? item.due_date : null,
    netFee: convertToNumber(item.net_fee as number | string | null),
    updatedAt: String(item.updated_at),
  };
}

function mapStaffWorkloadItem(
  row: {
    staff_id: string
    display_name: string
    role: string
    assigned_preparation: number
    assigned_review: number
    in_preparation: number
    awaiting_review: number
    overdue: number
    due_next_seven_days: number
    on_hold: number
  }
): DashboardStaffWorkloadItem {
  return {
    staffId: row.staff_id,
    displayName: row.display_name,
    role: row.role,
    assignedPreparation: row.assigned_preparation,
    assignedReview: row.assigned_review,
    inPreparation: row.in_preparation,
    awaitingReview: row.awaiting_review,
    overdue: row.overdue,
    dueNextSevenDays: row.due_next_seven_days,
    onHold: row.on_hold,
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    summaryResult,
    workloadResult,
    activityResult,
    recentReturnsResult,
    attentionResult,
    monthlyFinancialResult,
    statusMetricsResult,
    staffWorkloadResult,
  ] = await Promise.all([
    supabase.rpc("get_dashboard_summary"),
    getDashboardWorkloadRpc(),
    supabase.rpc("get_recent_dashboard_activity", {
      requested_limit: 8,
    }),
    supabase.rpc("get_dashboard_recent_returns", {
      requested_limit: 8,
    }),
    supabase.rpc("get_dashboard_attention_items", {
      requested_limit: 8,
    }),
    callDashboardAnalyticsRpc<DashboardMonthlyFinancialRpcRow>(
      "get_dashboard_monthly_financials",
    ),
    callDashboardAnalyticsRpc<DashboardStatusMetricRpcRow>(
      "get_dashboard_status_metrics",
    ),
    callDashboardAnalyticsRpc<DashboardStaffWorkloadRpcRow>(
      "get_dashboard_staff_workload",
    ),
  ]);

  if (summaryResult.error) {
    throw summaryResult.error;
  }

  if (workloadResult.error) {
    throw workloadResult.error;
  }

  if (activityResult.error) {
    throw activityResult.error;
  }

  if (recentReturnsResult.error) {
    throw recentReturnsResult.error;
  }

  if (attentionResult.error) {
    throw attentionResult.error;
  }

  if (monthlyFinancialResult.error) {
    throw monthlyFinancialResult.error;
  }

  if (statusMetricsResult.error) {
    throw statusMetricsResult.error;
  }

  if (staffWorkloadResult.error) {
    throw staffWorkloadResult.error;
  }

  const summaryRow = summaryResult.data?.[0];
  const workloadRow = workloadResult.data?.[0];

  const summary: DashboardSummary = {
  activeClients: convertToNumber(
    summaryRow?.active_clients,
  ),

  totalReturns: convertToNumber(
    summaryRow?.total_returns,
  ),

  openReturns: convertToNumber(
    summaryRow?.open_returns,
  ),

  completedReturns: convertToNumber(
    summaryRow?.completed_returns,
  ),

  inProgressReturns: convertToNumber(
    summaryRow?.in_progress_returns,
  ),

  awaitingReviewReturns: convertToNumber(
    summaryRow?.awaiting_review_returns,
  ),

  documentsPending: convertToNumber(
    summaryRow?.documents_pending,
  ),

  upcomingDeadlines: convertToNumber(
    summaryRow?.upcoming_deadlines,
  ),

  overdueReturns: convertToNumber(
    summaryRow?.overdue_returns,
  ),

  unassignedReturns: convertToNumber(
    summaryRow?.unassigned_returns,
  ),

  totalFees: convertToNumber(
    summaryRow?.total_fees,
  ),

  totalPayments: convertToNumber(
    summaryRow?.total_payments,
  ),

  outstandingBalance: convertToNumber(
    summaryRow?.outstanding_balance,
  ),

  workflow: {
    intake: convertToNumber(
      summaryRow?.workflow_intake,
    ),

    documentsPending: convertToNumber(
      summaryRow?.workflow_documents_pending,
    ),

    readyForPreparation: convertToNumber(
      summaryRow?.workflow_ready_for_preparation,
    ),

    inPreparation: convertToNumber(
      summaryRow?.workflow_in_preparation,
    ),

    review: convertToNumber(
      summaryRow?.workflow_review,
    ),

    signaturePending: convertToNumber(
      summaryRow?.workflow_signature_pending,
    ),

    readyToFile: convertToNumber(
      summaryRow?.workflow_ready_to_file,
    ),

    filed: convertToNumber(
      summaryRow?.workflow_filed,
    ),

    completed: convertToNumber(
      summaryRow?.workflow_completed,
    ),

    onHold: convertToNumber(
      summaryRow?.workflow_on_hold,
    ),
  },
};

  const workload: DashboardWorkload = {
    assignedToMe: convertToNumber(workloadRow?.assigned_to_me),
    reviewAssignedToMe: convertToNumber(workloadRow?.review_assigned_to_me),
    dueToday: convertToNumber(workloadRow?.due_today),
    dueThisWeek: convertToNumber(workloadRow?.due_this_week),
    overdue: convertToNumber(workloadRow?.overdue),
  };

  const activities: DashboardActivity[] = (activityResult.data ?? []).map(
    (activity) => ({
      id: String(activity.id),
      action: activity.action,
      entityType: activity.entity_type,
      entityId: activity.entity_id,
      actorName: activity.actor_name,
      occurredAt: activity.occurred_at,
    }),
  );

  const recentReturns = (recentReturnsResult.data ?? []).map((item) =>
    mapReturnItem(item),
  );

  const attentionItems: DashboardAttentionItem[] = (
    attentionResult.data ?? []
  ).map((item) => ({
    ...mapReturnItem(item),
    reason: item.reason as DashboardAttentionItem["reason"],
  }));

  const analytics: DashboardAnalytics = {
    monthlyFinancials: (monthlyFinancialResult.data ?? []).map((item) => ({
      month: item.month_start,
      monthLabel: item.month_label,
      fees: convertToNumber(item.fees),
      payments: convertToNumber(item.payments),
      outstanding: convertToNumber(item.outstanding),
    })),
    statusMetrics: (statusMetricsResult.data ?? []).map((item) => ({
      status: item.status,
      label: item.status_label,
      count: convertToNumber(item.return_count),
    })),
    staffWorkload: (staffWorkloadResult.data ?? []).map((item) => ({
      staffId: item.staff_id,
      staffName: item.staff_name,
      assignedReturns: convertToNumber(item.assigned_returns),
      overdueReturns: convertToNumber(item.overdue_returns),
      awaitingReviewReturns: convertToNumber(
        item.awaiting_review_returns,
      ),
    })),
  };

  return {
    summary,
    workload,
    activities,
    recentReturns,
    attentionItems,
    analytics,
    loadedAt: new Date().toISOString(),
  };
}
