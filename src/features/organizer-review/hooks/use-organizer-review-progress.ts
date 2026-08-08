import {
  useMemo,
} from "react"

import {
  getOrganizerReviewProgress,
} from "@/features/organizer-review/services"

import type {
  OrganizerReviewProgress,
} from "@/features/organizer-review/types"

import {
  useOrganizerReview,
} from "./use-organizer-review"

interface UseOrganizerReviewProgressResult {
  progress:
    OrganizerReviewProgress | null

  isLoading: boolean

  errorMessage:
    string | null

  refresh:
    () => Promise<void>
}

export function useOrganizerReviewProgress(
  clientId: string,
  taxYear: number,
): UseOrganizerReviewProgressResult {
  const {
    overview,
    isLoading,
    errorMessage,
    refresh,
  } = useOrganizerReview(
    clientId,
    taxYear,
  )

  const progress =
    useMemo(
      () => {
        if (!overview) {
          return null
        }

        return getOrganizerReviewProgress(
          overview,
        )
      },
      [
        overview,
      ],
    )

  return {
    progress,
    isLoading,
    errorMessage,
    refresh,
  }
}
