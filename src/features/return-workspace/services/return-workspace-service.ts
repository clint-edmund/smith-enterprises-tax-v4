import { supabase } from "@/services/supabase"

import type {
  ReturnWorkspaceSummary,
} from "../types/return-workspace.types"

export async function getReturnWorkspaceSummary(
  returnId: string,
): Promise<ReturnWorkspaceSummary> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_return_workspace_summary",
    {
      p_return_id: returnId,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (
    !data ||
    data.length === 0
  ) {
    throw new Error(
      "Return not found.",
    )
  }

  const summary =
    data[0]

  return {
    returnId:
      summary.return_id,

    clientId:
      summary.client_id,

    clientName:
      summary.client_name,

    taxYear:
      summary.tax_year,

    returnType:
      summary.return_type,

    status:
      summary.status,

    assignedPreparer:
      summary.assigned_preparer,

    assignedReviewer:
      summary.assigned_reviewer,

    dueDate:
      summary.due_date,

    estimatedAmountDue:
      Number(
        summary.estimated_amount_due,
      ),

    paymentsReceived:
      Number(
        summary.payments_received,
      ),

    outstandingBalance:
      Number(
        summary.outstanding_balance,
      ),

    createdAt:
      summary.created_at,

    updatedAt:
      summary.updated_at,

    workflowPercent:
      summary.workflow_percent,
  }
}