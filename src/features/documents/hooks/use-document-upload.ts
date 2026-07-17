import { useCallback, useState } from "react"

import { uploadClientDocument } from "@/features/documents/services/document-service"
import type {
  ClientDocument,
  DocumentCategory,
} from "@/features/documents/types/document.types"
import { validateDocumentFile } from "@/features/documents/utils/document-utils"

export type DocumentUploadState = "queued" | "uploading" | "complete" | "error"

export interface DocumentUploadItem {
  id: string
  file: File
  state: DocumentUploadState
  errorMessage: string | null
}

interface UseDocumentUploadOptions {
  clientId: string
  taxReturnId?: string | null
  category: DocumentCategory
  description?: string
  onUploaded?: (document: ClientDocument) => void
}

export function useDocumentUpload({
  clientId,
  taxReturnId = null,
  category,
  description,
  onUploaded,
}: UseDocumentUploadOptions) {
  const [items, setItems] = useState<DocumentUploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const addFiles = useCallback((files: File[]) => {
    const nextItems = files.map<DocumentUploadItem>((file) => {
      const validation = validateDocumentFile(file)

      return {
        id: crypto.randomUUID(),
        file,
        state: validation.isValid ? "queued" : "error",
        errorMessage: validation.errorMessage,
      }
    })

    setItems((current) => [...current, ...nextItems])
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setItems((current) => current.filter((item) => item.id !== itemId))
  }, [])

  const clearCompleted = useCallback(() => {
    setItems((current) => current.filter((item) => item.state !== "complete"))
  }, [])

  const uploadQueued = useCallback(async () => {
    const queuedItems = items.filter((item) => item.state === "queued")

    if (queuedItems.length === 0) {
      return
    }

    setIsUploading(true)

    for (const item of queuedItems) {
      setItems((current) => current.map((candidate) =>
        candidate.id === item.id
          ? { ...candidate, state: "uploading", errorMessage: null }
          : candidate,
      ))

      try {
        const document = await uploadClientDocument({
          clientId,
          taxReturnId,
          category,
          description,
          file: item.file,
        })

        setItems((current) => current.map((candidate) =>
          candidate.id === item.id
            ? { ...candidate, state: "complete", errorMessage: null }
            : candidate,
        ))
        onUploaded?.(document)
      } catch (error) {
        setItems((current) => current.map((candidate) =>
          candidate.id === item.id
            ? {
                ...candidate,
                state: "error",
                errorMessage: error instanceof Error
                  ? error.message
                  : "The document could not be uploaded.",
              }
            : candidate,
        ))
      }
    }

    setIsUploading(false)
  }, [category, clientId, description, items, onUploaded, taxReturnId])

  return {
    items,
    isUploading,
    addFiles,
    removeItem,
    clearCompleted,
    uploadQueued,
  }
}
