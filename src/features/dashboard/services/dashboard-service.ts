import { supabase } from "@/services/supabase"
import type {
  DashboardActivity,
  DashboardData,
  DashboardSummary,
} from "@/features/dashboard/types/dashboard.types"

function convertToNumber(
  value:
    | number
    | string
    | null,
): number {
  if (value === null) {
    return 0
  }

  const convertedValue = Number(value)

  return Number.isFinite(convertedValue)
    ? convertedValue
    : 0
}

export async function getDashboardData():
  Promise<DashboardData> {
  const [
    summaryResult,
    activityResult,
  ] = await Promise.all([
    supabase.rpc(
      "get_dashboard_summary",
    ),
    supabase.rpc(
      "get_recent_dashboard_activity",
      {
        requested_limit: 8,
      },
    ),
  ])

  if (summaryResult.error) {
    throw summaryResult.error
  }

  if (activityResult.error) {
    throw activityResult.error
  }

  const summaryRow =
    summaryResult.data?.[0]

  const summary: DashboardSummary = {
    activeClients: convertToNumber(
      summaryRow?.active_clients ?? 0,
    ),
    openReturns: convertToNumber(
      summaryRow?.open_returns ?? 0,
    ),
    completedReturns: convertToNumber(
      summaryRow?.completed_returns ?? 0,
    ),
    totalFees: convertToNumber(
      summaryRow?.total_fees ?? 0,
    ),
    totalPayments: convertToNumber(
      summaryRow?.total_payments ?? 0,
    ),
    outstandingBalance:
      convertToNumber(
        summaryRow?.outstanding_balance ??
          0,
      ),
    documentsPending: convertToNumber(
      summaryRow?.documents_pending ??
        0,
    ),
  }

  const activities: DashboardActivity[] =
    (activityResult.data ?? []).map(
      (activity) => ({
        id: activity.id,
        action: activity.action,
        entityType:
          activity.entity_type,
        entityId:
          activity.entity_id,
        actorName:
          activity.actor_name,
        occurredAt:
          activity.occurred_at,
      }),
    )

  return {
    summary,
    activities,
  }
}