import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  addOrganizerReviewStaffNote,
  getOrganizerReviewTimeline,
} from "@/features/organizer-review/services/organizer-review-timeline-service"

import type {
  OrganizerReviewTimelineEntry,
  OrganizerReviewTimelineSectionKey,
  OrganizerReviewTimelineSubjectType,
} from "@/features/organizer-review/types/organizer-review-timeline.types"

interface UseOrganizerReviewTimelineOptions {
  organizerId: string
  sectionKey:
    OrganizerReviewTimelineSectionKey
  subjectType:
    OrganizerReviewTimelineSubjectType
  subjectId: string
}

interface UseOrganizerReviewTimelineResult {
  entries:
    OrganizerReviewTimelineEntry[]
  isLoading: boolean
  isSaving: boolean
  errorMessage:
    string | null
  successMessage:
    string | null
  refresh: () => Promise<void>
  addStaffNote: (
    noteText: string,
  ) => Promise<boolean>
  clearMessages: () => void
}

export function useOrganizerReviewTimeline({
  organizerId,
  sectionKey,
  subjectType,
  subjectId,
}: UseOrganizerReviewTimelineOptions): UseOrganizerReviewTimelineResult {
  const [
    entries,
    setEntries,
  ] =
    useState<
      OrganizerReviewTimelineEntry[]
    >([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    )

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null,
    )

  const normalizedOrganizerId =
    organizerId.trim()

  const normalizedSubjectId =
    subjectId.trim()

  const clearMessages =
    useCallback(() => {
      setErrorMessage(null)
      setSuccessMessage(null)
    }, [])

  const refresh =
    useCallback(async () => {
      if (
        !normalizedOrganizerId ||
        !normalizedSubjectId
      ) {
        setEntries([])

        setErrorMessage(
          "A valid organizer and review subject are required.",
        )

        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getOrganizerReviewTimeline({
            organizerId:
              normalizedOrganizerId,

            subjectType,

            subjectId:
              normalizedSubjectId,
          })

        setEntries(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load the organizer review timeline:",
          error,
        )

        setEntries([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the review timeline.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [
      normalizedOrganizerId,
      normalizedSubjectId,
      subjectType,
    ])

  useEffect(() => {
    void refresh()
  }, [
    refresh,
  ])

  const addStaffNote =
    useCallback(
      async (
        noteText: string,
      ): Promise<boolean> => {
        try {
          setIsSaving(true)
          clearMessages()

          const savedEntry =
            await addOrganizerReviewStaffNote({
              organizerId:
                normalizedOrganizerId,

              sectionKey,

              subjectType,

              subjectId:
                normalizedSubjectId,

              noteText,
            })

          setEntries(
            (current) => [
              savedEntry,
              ...current,
            ],
          )

          setSuccessMessage(
            "Staff note added to the review timeline.",
          )

          return true
        } catch (error) {
          console.error(
            "Unable to add the organizer review timeline note:",
            error,
          )

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to add the staff note.",
          )

          return false
        } finally {
          setIsSaving(false)
        }
      },
      [
        clearMessages,
        normalizedOrganizerId,
        normalizedSubjectId,
        sectionKey,
        subjectType,
      ],
    )

  return {
    entries,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    refresh,
    addStaffNote,
    clearMessages,
  }
}
