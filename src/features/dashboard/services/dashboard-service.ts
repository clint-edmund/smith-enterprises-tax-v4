import { supabase } from "@/services/supabase";
import type {
  DashboardAttentionItem,
  DashboardAnalytics,
  DashboardData,
  DashboardExecutiveMetrics,
  DashboardReadinessMetrics,
  DashboardRecommendation,
  DashboardReturnItem,
  DashboardStaffWorkload,
  DashboardStaffWorkloadItem,
  DashboardSummary,
  DashboardWorkload,
  DashboardPriorityItem,
  DashboardRiskMetrics,
} from "@/features/dashboard/types/dashboard.types"
import type { PostgrestError } from "@supabase/supabase-js";
import type {
  ReturnStatus,
  ReturnType,
  TaxFormType,
} from "@/features/returns/types/return.types";


import type {
  DashboardActivity,
} from "@/features/dashboard/types/activity.types";

type DashboardReadinessRpcRow = {
  active_returns: number | string | null
  readiness_eligible_returns: number | string | null
  ready_for_preparation: number | string | null
  needs_documents: number | string | null
  missing_preparer: number | string | null
  ready_for_review: number | string | null
  blocked_returns: number | string | null
  overdue_returns: number | string | null
  average_readiness_score: number | string | null
  office_health_score: number | string | null
}

type DashboardRecommendationRpcRow = {
  id: string
  return_id: string
  client_id: string
  client_name: string
  tax_year: number | string | null
  return_type: ReturnType
  recommendation_type: DashboardRecommendation["recommendationType"]
  title: string
  explanation: string
  priority: DashboardRecommendation["priority"]
  readiness_score: number | string | null
  due_date: string | null
  action_route: string
}

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

interface ActivityRow {
  id: string | number
  action: string
  entity_type: string | null
  entity_id: string | null
  actor_name: string | null
  occurred_at: string
  description?: string | null
}

async function callDashboardAnalyticsRpc<T>(
  functionName: string,
): Promise<DashboardAnalyticsRpcResult<T>> {
  const rpc = supabase.rpc.bind(supabase) as unknown as (
    name: string,
  ) => PromiseLike<DashboardAnalyticsRpcResult<T>>;

  return rpc(functionName);
}

function mapActivityRow(
  row: ActivityRow,
): DashboardActivity {
  return {
    id: String(row.id),
    action: row.action,
    entityType:
      row.entity_type ?? "system",
    entityId:
      row.entity_id ?? null,
    actorName:
      row.actor_name?.trim() || "System",
    occurredAt: row.occurred_at,
    description:
      row.description?.trim() || undefined,
  };
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
    "get_staff_workload_summary",
  )

  if (error) {
    throw new Error(
      `Unable to load staff workload: ${error.message}`,
    )
  }

  const staff = (data ?? []).map(
    mapStaffWorkloadItem,
  )

  return {
    staff,

    totalAssignedPreparation: staff.reduce(
      (total, item) =>
        total + item.assignedPreparation,
      0,
    ),

    totalAssignedReview: staff.reduce(
      (total, item) =>
        total + item.assignedReview,
      0,
    ),

    totalOverdue: staff.reduce(
      (total, item) =>
        total + item.overdue,
      0,
    ),

    totalOnHold: staff.reduce(
      (total, item) =>
        total + item.onHold,
      0,
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

function mapDashboardRecommendation(
  row: DashboardRecommendationRpcRow,
): DashboardRecommendation {
  return {
    id: row.id,
    returnId: row.return_id,
    clientId: row.client_id,
    clientName: row.client_name,
    taxYear: convertToNumber(row.tax_year),
    returnType: row.return_type,
    recommendationType:
      row.recommendation_type,
    title: row.title,
    explanation: row.explanation,
    priority: row.priority,
    readinessScore: convertToNumber(
      row.readiness_score,
    ),
    dueDate: row.due_date,
    actionRoute: row.action_route,
  }
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
  },
): DashboardStaffWorkloadItem {
  const recommendedMaximum = 25

  const totalAssigned =
    row.assigned_preparation +
    row.assigned_review

  const capacityPercentage = Math.round(
    (totalAssigned / recommendedMaximum) * 100,
  )

  let capacityStatus:
    DashboardStaffWorkloadItem["capacityStatus"]

  if (capacityPercentage >= 100) {
    capacityStatus = "overloaded"
  } else if (capacityPercentage >= 75) {
    capacityStatus = "heavy"
  } else if (capacityPercentage >= 50) {
    capacityStatus = "moderate"
  } else {
    capacityStatus = "available"
  }

  return {
    staffId: row.staff_id,
    displayName: row.display_name,
    role: row.role,
    assignedPreparation:
      row.assigned_preparation,
    assignedReview:
      row.assigned_review,
    inPreparation:
      row.in_preparation,
    awaitingReview:
      row.awaiting_review,
    overdue:
      row.overdue,
    dueNextSevenDays:
      row.due_next_seven_days,
    onHold:
      row.on_hold,
    capacityPercentage,
    capacityStatus,
    recommendedMaximum,
  }
}

export async function getRecentDashboardActivity(
  limit = 8,
): Promise<DashboardActivity[]> {
  const { data, error } = await supabase.rpc(
    "get_recent_dashboard_activity",
    {
      requested_limit: limit,
    },
  )

  if (error) {
    throw new Error(
      `Unable to load recent dashboard activity: ${error.message}`,
    )
  }

  return (
    (data ?? []) as ActivityRow[]
  ).map(mapActivityRow)
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
  summaryResult,
  executiveResult,
  workloadResult,
  readinessResult,
  recommendationsResult,
  activityResult,
  recentReturnsResult,
  attentionResult,
  monthlyFinancialResult,
  statusMetricsResult,
  staffWorkloadResult,
] = await Promise.all([
    supabase.rpc("get_dashboard_summary"),

    supabase.rpc(
      "get_dashboard_executive_metrics",
    ),

    getDashboardWorkloadRpc(),

    callDashboardAnalyticsRpc<DashboardReadinessRpcRow>(
      "get_dashboard_readiness_metrics",
    ),

    callDashboardAnalyticsRpc<DashboardRecommendationRpcRow>(
      "get_dashboard_smart_recommendations",
    ),

    supabase.rpc(
      "get_recent_dashboard_activity",
      {
        requested_limit: 8,
      },
    ),

    supabase.rpc(
      "get_dashboard_recent_returns",
      {
        requested_limit: 8,
      },
    ),

    supabase.rpc(
      "get_dashboard_attention_items",
      {
        requested_limit: 8,
      },
    ),

    callDashboardAnalyticsRpc<DashboardMonthlyFinancialRpcRow>(
      "get_dashboard_monthly_financials",
    ),

    callDashboardAnalyticsRpc<DashboardStatusMetricRpcRow>(
      "get_dashboard_status_metrics",
    ),

    callDashboardAnalyticsRpc<DashboardStaffWorkloadRpcRow>(
      "get_dashboard_staff_workload",
    ),
  ])

  if (summaryResult.error) {
  throw summaryResult.error
  }

  if (executiveResult.error) {
  throw executiveResult.error
  }

  if (workloadResult.error) {
    throw workloadResult.error;
  }

  if (readinessResult.error) {
    throw readinessResult.error
  }

  if (recommendationsResult.error) {
    throw recommendationsResult.error
  }

  if (activityResult.error) {
    console.error(
      "Unable to load recent dashboard activity:",
      activityResult.error,
    )
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

  const summaryRow =
  summaryResult.data?.[0]

  const executiveRow =
    executiveResult.data?.[0]

  const workloadRow =
    workloadResult.data?.[0]

  const readinessRow =
    readinessResult.data?.[0]

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

  const executive: DashboardExecutiveMetrics = {
    projectedRevenue: convertToNumber(
      executiveRow?.projected_revenue,
    ),

    returnsDueNext7Days: convertToNumber(
      executiveRow?.due_next_7_days,
    ),

    returnsDueNext30Days: convertToNumber(
      executiveRow?.due_next_30_days,
    ),

    completedThisWeek: convertToNumber(
      executiveRow?.completed_this_week,
    ),

    completedThisMonth: convertToNumber(
      executiveRow?.completed_this_month,
    ),

    reviewQueue: convertToNumber(
      executiveRow?.review_queue,
    ),
  }

  const readiness: DashboardReadinessMetrics = {
    activeReturns: convertToNumber(
      readinessRow?.active_returns,
    ),

    readinessEligibleReturns: convertToNumber(
      readinessRow?.readiness_eligible_returns,
    ),

    readyForPreparation: convertToNumber(
      readinessRow?.ready_for_preparation,
    ),

    needsDocuments: convertToNumber(
      readinessRow?.needs_documents,
    ),

    missingPreparer: convertToNumber(
      readinessRow?.missing_preparer,
    ),

    readyForReview: convertToNumber(
      readinessRow?.ready_for_review,
    ),

    blockedReturns: convertToNumber(
      readinessRow?.blocked_returns,
    ),

    overdueReturns: convertToNumber(
      readinessRow?.overdue_returns,
    ),

    averageReadinessScore: convertToNumber(
      readinessRow?.average_readiness_score,
    ),

    officeHealthScore: convertToNumber(
      readinessRow?.office_health_score,
    ),
  }

  const recommendations:
    DashboardRecommendation[] =
    (
      recommendationsResult.data ?? []
    ).map(mapDashboardRecommendation)
  
  const workload: DashboardWorkload = {
    assignedToMe: convertToNumber(workloadRow?.assigned_to_me),
    reviewAssignedToMe: convertToNumber(workloadRow?.review_assigned_to_me),
    dueToday: convertToNumber(workloadRow?.due_today),
    dueThisWeek: convertToNumber(workloadRow?.due_this_week),
    overdue: convertToNumber(workloadRow?.overdue),
  };

  const activities: DashboardActivity[] =
  activityResult.error
    ? []
    : (
        (activityResult.data ?? []) as ActivityRow[]
      ).map(mapActivityRow)

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

  const risk: DashboardRiskMetrics = {
    evaluatedReturns: 0,
    criticalRiskReturns: 0,
    highRiskReturns: 0,
    mediumRiskReturns: 0,
    lowRiskReturns: 0,
    overdueReturns: 0,
    dueWithinThreeDays: 0,
    dueWithinSevenDays: 0,
    inactiveReturns: 0,
    averageRiskScore: 0,
  }

const priorityQueue: DashboardPriorityItem[] = []

  return {
  summary,
  executive,
  workload,
  readiness,
  recommendations,
  risk,
  priorityQueue,
  activities,
  recentReturns,
  attentionItems,
  analytics,
  loadedAt: new Date().toISOString(),
}
}
