import { useCallback, useState } from "react"

import {
  findPotentialDocumentDuplicates,
  uploadClientDocument,
  type DocumentDuplicateCandidate,
} from "@/features/documents/services/document-service"
import type {
  ClientDocument,
  DocumentCategory,
} from "@/features/documents/types/document.types"
import { validateDocumentFile } from "@/features/documents/utils/document-utils"

export type DocumentUploadState =
  | "checking"
  | "queued"
  | "duplicate"
  | "uploading"
  | "complete"
  | "skipped"
  | "error"

export interface DocumentUploadItem {
  id: string
  file: File
  state: DocumentUploadState
  errorMessage: string | null
  duplicateDocuments: ClientDocument[]
}

interface UseDocumentUploadOptions {
  clientId: string
  taxReturnId?: string | null
  category: DocumentCategory
  description?: string
  onUploaded?: (document: ClientDocument) => void
}

function createFileSignature(
  file: File,
  category: DocumentCategory,
): string {
  return [
    file.name.trim().toLocaleLowerCase(),
    file.size,
    category,
  ].join("::")
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
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)

  const addFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) {
      return
    }

    const nextItems = files.map<DocumentUploadItem>((file) => {
      const validation = validateDocumentFile(file)

      return {
        id: crypto.randomUUID(),
        file,
        state: validation.isValid ? "checking" : "error",
        errorMessage: validation.errorMessage,
        duplicateDocuments: [],
      }
    })

    setItems((current) => [...current, ...nextItems])

    const validItems = nextItems.filter(
      (item) => item.state === "checking",
    )

    if (validItems.length === 0) {
      return
    }

    setIsCheckingDuplicates(true)

    try {
      const candidates: DocumentDuplicateCandidate[] =
        validItems.map((item) => ({
          id: item.id,
          fileName: item.file.name,
          sizeBytes: item.file.size,
          category,
        }))

      const matches = await findPotentialDocumentDuplicates(
        clientId,
        taxReturnId,
        candidates,
      )

      const matchesByCandidate = new Map(
        matches.map((match) => [
          match.candidateId,
          match.documents,
        ]),
      )

      setItems((current) => {
        const existingSignatures = new Set(
          current
            .filter(
              (item) =>
                !validItems.some(
                  (validItem) => validItem.id === item.id,
                ) &&
                item.state !== "error" &&
                item.state !== "skipped",
            )
            .map((item) => createFileSignature(item.file, category)),
        )

        return current.map((item) => {
          const validItem = validItems.find(
            (candidate) => candidate.id === item.id,
          )

          if (!validItem) {
            return item
          }

          const databaseMatches =
            matchesByCandidate.get(item.id) ?? []
          const signature = createFileSignature(
            item.file,
            category,
          )
          const duplicateInQueue =
            existingSignatures.has(signature)

          existingSignatures.add(signature)

          if (
            databaseMatches.length > 0 ||
            duplicateInQueue
          ) {
            return {
              ...item,
              state: "duplicate",
              errorMessage: duplicateInQueue
                ? "Another matching file is already in this upload queue."
                : "A matching document already exists for this client.",
              duplicateDocuments: databaseMatches,
            }
          }

          return {
            ...item,
            state: "queued",
            errorMessage: null,
            duplicateDocuments: [],
          }
        })
      })
    } catch (error) {
      setItems((current) =>
        current.map((item) =>
          validItems.some(
            (candidate) => candidate.id === item.id,
          )
            ? {
                ...item,
                state: "error",
                errorMessage:
                  error instanceof Error
                    ? `Duplicate check failed: ${error.message}`
                    : "Duplicate check failed.",
              }
            : item,
        ),
      )
    } finally {
      setIsCheckingDuplicates(false)
    }
  }, [category, clientId, taxReturnId])

  const removeItem = useCallback((itemId: string) => {
    setItems((current) =>
      current.filter((item) => item.id !== itemId),
    )
  }, [])

  const keepDuplicate = useCallback((itemId: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              state: "queued",
              errorMessage: null,
            }
          : item,
      ),
    )
  }, [])

  const skipDuplicate = useCallback((itemId: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              state: "skipped",
              errorMessage: null,
            }
          : item,
      ),
    )
  }, [])

  const clearCompleted = useCallback(() => {
    setItems((current) =>
      current.filter(
        (item) =>
          item.state !== "complete" &&
          item.state !== "skipped",
      ),
    )
  }, [])

  const uploadQueued = useCallback(async () => {
    const queuedItems = items.filter(
      (item) => item.state === "queued",
    )

    if (queuedItems.length === 0) {
      return
    }

    setIsUploading(true)

    try {
      for (const item of queuedItems) {
        setItems((current) =>
          current.map((candidate) =>
            candidate.id === item.id
              ? {
                  ...candidate,
                  state: "uploading",
                  errorMessage: null,
                }
              : candidate,
          ),
        )

        try {
          const document = await uploadClientDocument({
            clientId,
            taxReturnId,
            category,
            description,
            file: item.file,
          })

          setItems((current) =>
            current.map((candidate) =>
              candidate.id === item.id
                ? {
                    ...candidate,
                    state: "complete",
                    errorMessage: null,
                  }
                : candidate,
            ),
          )

          onUploaded?.(document)
        } catch (error) {
          setItems((current) =>
            current.map((candidate) =>
              candidate.id === item.id
                ? {
                    ...candidate,
                    state: "error",
                    errorMessage:
                      error instanceof Error
                        ? error.message
                        : "The document could not be uploaded.",
                  }
                : candidate,
            ),
          )
        }
      }
    } finally {
      setIsUploading(false)
    }
  }, [
    category,
    clientId,
    description,
    items,
    onUploaded,
    taxReturnId,
  ])

  return {
    items,
    isUploading,
    isCheckingDuplicates,
    addFiles,
    removeItem,
    keepDuplicate,
    skipDuplicate,
    clearCompleted,
    uploadQueued,
  }
}
