import { supabase } from "@/services/supabase"

import type {
  ReturnWorkflowHistoryItem,
} from "../types/return-workflow-history.types"

import type {
  ReturnWorkflowEventType,
} from "../types/return-workflow.types"

export async function getReturnWorkflowHistory(
  taxReturnId: string,
): Promise<ReturnWorkflowHistoryItem[]> {

  const normalizedReturnId =
    taxReturnId.trim()

  if (!normalizedReturnId) {
    return []
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_return_workflow_history",
    {
      requested_return_id:
        normalizedReturnId,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (!data) {
    return []
  }

  return data.map(
    (item) => ({
      id:
        item.id,

      taxReturnId:
        item.tax_return_id,

      clientId:
        item.client_id,

      eventType:
        item.event_type as ReturnWorkflowEventType,

      eventLabel:
        item.event_label,

      eventDescription:
        item.event_description,

      eventData:
        item.event_data,

      actorUserId:
        item.actor_user_id,

      actorName:
        item.actor_name ??
        "System",

      occurredAt:
        item.occurred_at,

      createdAt:
        item.created_at,

      isClientVisible:
        item.is_client_visible,
    }),
  )
}