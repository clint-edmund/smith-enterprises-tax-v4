import { useCallback, useEffect, useState } from "react"
import {
  listOrganizerAvailableDocuments,
  registerDocumentAsEvidence,
} from "@/features/organizer-review/services/evidence-document-service"
import type {
  OrganizerAvailableDocument,
  RegisterDocumentEvidenceRequest,
} from "@/features/organizer-review/types/evidence.types"

export function useEvidenceDocumentLibrary(organizerId: string) {
  const [documents, setDocuments] = useState<OrganizerAvailableDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingDocumentId, setSavingDocumentId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const clearMessages = useCallback(() => {
    setErrorMessage(null)
    setSuccessMessage(null)
  }, [])

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      setDocuments(await listOrganizerAvailableDocuments(organizerId))
    } catch (error) {
      console.error("Unable to load organizer documents:", error)
      setDocuments([])
      setErrorMessage(error instanceof Error ? error.message : "Unable to load organizer documents.")
    } finally {
      setIsLoading(false)
    }
  }, [organizerId])

  useEffect(() => { void refresh() }, [refresh])

  const registerDocument = useCallback(async (
    request: Omit<RegisterDocumentEvidenceRequest, "organizerId">,
  ): Promise<boolean> => {
    try {
      setSavingDocumentId(request.documentId)
      clearMessages()
      await registerDocumentAsEvidence({ organizerId, ...request })
      await refresh()
      setSuccessMessage("Document linked as evidence.")
      return true
    } catch (error) {
      console.error("Unable to link document evidence:", error)
      setErrorMessage(error instanceof Error ? error.message : "Unable to link document evidence.")
      return false
    } finally {
      setSavingDocumentId(null)
    }
  }, [clearMessages, organizerId, refresh])

  return {
    documents,
    isLoading,
    savingDocumentId,
    errorMessage,
    successMessage,
    refresh,
    registerDocument,
    clearMessages,
  }
}
