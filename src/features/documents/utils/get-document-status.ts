import type { RequiredReturnDocument } from "../types/required-document.types"
import type { DocumentStatus } from "../types/document-status"

interface GetDocumentStatusOptions {
  hasSuggestedMatch?: boolean
}

export function getDocumentStatus(
  document: RequiredReturnDocument,
  options: GetDocumentStatusOptions = {},
): DocumentStatus {
  const { hasSuggestedMatch = false } = options

  if (!document.isRequired && !document.isComplete) {
    return "not-required"
  }

  if (document.isComplete && document.completedAt) {
    return "verified"
  }

  if (document.isComplete || document.matchedDocumentId) {
    return "received"
  }

  if (hasSuggestedMatch) {
    return "suggested"
  }

  return "missing"
}