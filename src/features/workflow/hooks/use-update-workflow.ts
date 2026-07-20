import { useState } from "react"

import {
  updateWorkflowStatus,
  type WorkflowUpdate,
} from "../services/workflow-service"

export function useUpdateWorkflow() {
  const [isUpdating, setIsUpdating] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const updateWorkflow = async (
    returnId: string,
    update: WorkflowUpdate,
  ) => {
    setIsUpdating(true)
    setError(null)

    try {
      const updatedReturn =
        await updateWorkflowStatus(
          returnId,
          update,
        )

      return updatedReturn
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update the workflow."

      setError(message)

      throw caughtError
    } finally {
      setIsUpdating(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    isUpdating,
    error,
    updateWorkflow,
    clearError,
  }
}