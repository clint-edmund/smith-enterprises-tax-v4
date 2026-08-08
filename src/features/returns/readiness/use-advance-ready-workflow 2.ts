import {
  useState,
} from "react"

import {
  advanceReturnToPreparation,
} from "@/features/workflow/services/workflow-service"

interface UseAdvanceReadyWorkflowResult {
  isAdvancing: boolean
  error: string | null
  successMessage: string | null
  advance: (
    returnId: string,
  ) => Promise<void>
  clearMessages: () => void
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message
  }

  return "Unable to advance the return workflow."
}

export function useAdvanceReadyWorkflow():
  UseAdvanceReadyWorkflowResult {
  const [
    isAdvancing,
    setIsAdvancing,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(null)

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null)

  async function advance(
    returnId: string,
  ): Promise<void> {
    setIsAdvancing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await advanceReturnToPreparation(
        returnId,
      )

      setSuccessMessage(
        "The return was moved to Ready for Preparation.",
      )
    } catch (caughtError) {
      const message =
        getErrorMessage(caughtError)

      setError(message)

      throw caughtError
    } finally {
      setIsAdvancing(false)
    }
  }

  function clearMessages() {
    setError(null)
    setSuccessMessage(null)
  }

  return {
    isAdvancing,
    error,
    successMessage,
    advance,
    clearMessages,
  }
}