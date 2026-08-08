import {
  useCallback,
  useEffect,
  useState,
} from "react"

import {
  createAndLinkEvidence,
  getSubjectEvidence,
  updateEvidenceVerification,
} from "@/features/organizer-review/services/evidence-service"

import type {
  CreateAndLinkEvidenceRequest,
  GetSubjectEvidenceRequest,
  OrganizerEvidenceSource,
  UpdateEvidenceVerificationRequest,
} from "@/features/organizer-review/types/evidence.types"

interface UseEvidenceRegistryResult {
  evidence:
    OrganizerEvidenceSource[]
  isLoading: boolean
  isSaving: boolean
  savingEvidenceId:
    string | null
  errorMessage:
    string | null
  successMessage:
    string | null
  refresh: () => Promise<void>
  createEvidence: (
    request:
      Omit<
        CreateAndLinkEvidenceRequest,
        keyof GetSubjectEvidenceRequest
      >,
  ) => Promise<boolean>
  verifyEvidence: (
    request:
      UpdateEvidenceVerificationRequest,
  ) => Promise<boolean>
  clearMessages: () => void
}

export function useEvidenceRegistry(
  subject:
    GetSubjectEvidenceRequest,
): UseEvidenceRegistryResult {
  const [
    evidence,
    setEvidence,
  ] =
    useState<
      OrganizerEvidenceSource[]
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
    savingEvidenceId,
    setSavingEvidenceId,
  ] =
    useState<string | null>(
      null,
    )

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

  const clearMessages =
    useCallback(() => {
      setErrorMessage(null)
      setSuccessMessage(null)
    }, [])

  const refresh =
    useCallback(async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getSubjectEvidence(
            subject,
          )

        setEvidence(
          result,
        )
      } catch (error) {
        console.error(
          "Unable to load evidence:",
          error,
        )

        setEvidence([])

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load evidence.",
        )
      } finally {
        setIsLoading(false)
      }
    }, [
      subject.organizerId,
      subject.sectionKey,
      subject.subjectId,
      subject.subjectType,
    ])

  useEffect(() => {
    void refresh()
  }, [
    refresh,
  ])

  const createEvidence =
    useCallback(
      async (
        request:
          Omit<
            CreateAndLinkEvidenceRequest,
            keyof GetSubjectEvidenceRequest
          >,
      ): Promise<boolean> => {
        try {
          setIsSaving(true)
          clearMessages()

          await createAndLinkEvidence({
            ...subject,
            ...request,
          })

          await refresh()

          setSuccessMessage(
            "Evidence added and linked.",
          )

          return true
        } catch (error) {
          console.error(
            "Unable to create evidence:",
            error,
          )

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to create evidence.",
          )

          return false
        } finally {
          setIsSaving(false)
        }
      },
      [
        clearMessages,
        refresh,
        subject.organizerId,
        subject.sectionKey,
        subject.subjectId,
        subject.subjectType,
      ],
    )

  const verifyEvidence =
    useCallback(
      async (
        request:
          UpdateEvidenceVerificationRequest,
      ): Promise<boolean> => {
        try {
          setSavingEvidenceId(
            request.evidenceId,
          )
          clearMessages()

          await updateEvidenceVerification(
            request,
          )

          await refresh()

          setSuccessMessage(
            "Evidence verification updated.",
          )

          return true
        } catch (error) {
          console.error(
            "Unable to update evidence verification:",
            error,
          )

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to update evidence verification.",
          )

          return false
        } finally {
          setSavingEvidenceId(
            null,
          )
        }
      },
      [
        clearMessages,
        refresh,
      ],
    )

  return {
    evidence,
    isLoading,
    isSaving,
    savingEvidenceId,
    errorMessage,
    successMessage,
    refresh,
    createEvidence,
    verifyEvidence,
    clearMessages,
  }
}
