import {
  useMemo,
} from "react"

import {
  useRequiredDocuments,
} from "@/features/documents/hooks/use-required-documents"
import type {
  TaxReturnDetails,
} from "@/features/returns/types/return.types"

import {
  calculateReturnReadiness,
} from "./readiness-engine"
import type {
  ReturnReadinessResult,
} from "./readiness.types"

interface UseReturnReadinessResult {
  readiness: ReturnReadinessResult
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useReturnReadiness(
  taxReturn: TaxReturnDetails,
): UseReturnReadinessResult {
  const {
    requiredDocuments,
    isLoading,
    error,
    refresh,
  } = useRequiredDocuments(
    taxReturn.id,
  )

  const readiness = useMemo(
    () =>
      calculateReturnReadiness({
        taxReturn,
        requiredDocuments,
      }),
    [
      taxReturn,
      requiredDocuments,
    ],
  )

  return {
    readiness,
    isLoading,
    error,
    refresh,
  }
}