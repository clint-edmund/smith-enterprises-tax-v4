import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  getReturnWorkspaceSummary,
} from "../services/return-workspace-service"

import type {
  ReturnWorkspaceSummary,
} from "../types/return-workspace.types"

interface UseReturnWorkspaceResult {
  summary: ReturnWorkspaceSummary | null

  isLoading: boolean

  error: string | null

  refresh: () => Promise<void>
}

export function useReturnWorkspace(
  returnId: string,
): UseReturnWorkspaceResult {
  const [summary, setSummary] =
    useState<ReturnWorkspaceSummary | null>(
      null,
    )

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)

      setError(null)

      const result =
        await getReturnWorkspaceSummary(
          returnId,
        )

      setSummary(result)
    } catch {
      setError(
        "Unable to load return workspace.",
      )
    } finally {
      setIsLoading(false)
    }
}, [returnId])

  useEffect(() => {
    void load()
  }, [load])

  return {
    summary,

    isLoading,

    error,

    refresh: load,
  }
}