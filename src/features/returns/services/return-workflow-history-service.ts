import type {
  ReturnWorkflowHistoryItem,
} from "../types/return-workflow-history.types"

export async function getReturnWorkflowHistory(
  taxReturnId: string,
): Promise<ReturnWorkflowHistoryItem[]> {

  if (!taxReturnId.trim()) {
    return []
  }

  throw new Error(
    "get_return_workflow_history() has not been implemented yet.",
  )
}