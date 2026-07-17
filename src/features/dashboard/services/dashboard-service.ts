import { supabase } from "@/services/supabase";
import type {
  DashboardActivity,
  DashboardAttentionItem,
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
  const rpc = supabase.rpc as unknown as (
    functionName: string,
  ) => PromiseLike<DashboardWorkloadRpcResult>;

  return rpc("get_dashboard_my_workload");
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

export async function getDashboardData(): Promise<DashboardData> {
  const [
    summaryResult,
    workloadResult,
    activityResult,
    recentReturnsResult,
    attentionResult,
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

  const summaryRow = summaryResult.data?.[0];
  const workloadRow = workloadResult.data?.[0];

  const summary: DashboardSummary = {
    activeClients: convertToNumber(summaryRow?.active_clients),
    totalReturns: convertToNumber(summaryRow?.total_returns),
    openReturns: convertToNumber(summaryRow?.open_returns),
    completedReturns: convertToNumber(summaryRow?.completed_returns),
    inProgressReturns: convertToNumber(summaryRow?.in_progress_returns),
    awaitingReviewReturns: convertToNumber(summaryRow?.awaiting_review_returns),
    documentsPending: convertToNumber(summaryRow?.documents_pending),
    upcomingDeadlines: convertToNumber(summaryRow?.upcoming_deadlines),
    overdueReturns: convertToNumber(summaryRow?.overdue_returns),
    unassignedReturns: convertToNumber(summaryRow?.unassigned_returns),
    totalFees: convertToNumber(summaryRow?.total_fees),
    totalPayments: convertToNumber(summaryRow?.total_payments),
    outstandingBalance: convertToNumber(summaryRow?.outstanding_balance),
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

  return {
    summary,
    workload,
    activities,
    recentReturns,
    attentionItems,
    loadedAt: new Date().toISOString(),
  };
}
