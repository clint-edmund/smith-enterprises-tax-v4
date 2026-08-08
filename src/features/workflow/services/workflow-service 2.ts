import { supabase } from "@/services/supabase"

import type {
  WorkflowStatus,
} from "../types/workflow.types"

export interface WorkflowUpdate {
  workflowStatus: WorkflowStatus
  holdReason?: string | null
  assignedPreparerId?: string | null
}

export async function updateWorkflowStatus(
  returnId: string,
  update: WorkflowUpdate,
) {
  const payload: {
    workflow_status: WorkflowStatus
    workflow_hold_reason: string | null
    assigned_preparer_id?: string | null
  } = {
    workflow_status:
      update.workflowStatus,

    workflow_hold_reason:
      update.holdReason ?? null,
  }

  if (
    update.assignedPreparerId !==
    undefined
  ) {
    payload.assigned_preparer_id =
      update.assignedPreparerId
  }

  const { data, error } =
    await supabase
      .from("tax_returns")
      .update(payload)
      .eq("id", returnId)
      .select()
      .single()

  if (error) {
    throw error
  }

  return data
}

export async function assignPreparer(
  returnId: string,
  preparerId: string,
) {
  return updateWorkflowStatus(
    returnId,
    {
      workflowStatus:
        "ready_for_preparation",

      assignedPreparerId:
        preparerId,
    },
  )
}

export async function advanceReturnToPreparation(
  returnId: string,
) {
  return updateWorkflowStatus(
    returnId,
    {
      workflowStatus:
        "ready_for_preparation",

      holdReason: null,
    },
  )
}

export async function holdReturn(
  returnId: string,
  reason: string,
) {
  return updateWorkflowStatus(
    returnId,
    {
      workflowStatus:
        "on_hold",

      holdReason:
        reason,
    },
  )
}

export async function resumeReturn(
  returnId: string,
) {
  return updateWorkflowStatus(
    returnId,
    {
      workflowStatus:
        "documents_pending",

      holdReason: null,
    },
  )
}

export async function completeReturn(
  returnId: string,
) {
  return updateWorkflowStatus(
    returnId,
    {
      workflowStatus:
        "completed",
    },
  )
}