import { useCallback, useState } from "react"

import {
  findExactDocumentDuplicates,
  uploadClientDocument,
  type DocumentDuplicateCandidate,
  type ExactDocumentDuplicate,
} from "@/features/documents/services/document-service"
import type {
  ClientDocument,
  DocumentCategory,
} from "@/features/documents/types/document.types"
import {
  calculateDocumentSha256,
  SHA_256_ALGORITHM,
} from "@/features/documents/utils/document-hash"
import {
  validateDocumentFile,
} from "@/features/documents/utils/document-utils"

export type DocumentUploadState =
  | "hashing"
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
  fileHash: string | null
  state: DocumentUploadState
  errorMessage: string | null
  duplicateDocuments: ExactDocumentDuplicate[]
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
  const [items, setItems] =
    useState<DocumentUploadItem[]>([])
  const [isUploading, setIsUploading] =
    useState(false)
  const [
    isCheckingDuplicates,
    setIsCheckingDuplicates,
  ] = useState(false)

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return
      }

      const nextItems = files.map<DocumentUploadItem>(
        (file) => {
          const validation =
            validateDocumentFile(file)

          return {
            id: crypto.randomUUID(),
            file,
            fileHash: null,
            state: validation.isValid
              ? "hashing"
              : "error",
            errorMessage:
              validation.errorMessage,
            duplicateDocuments: [],
          }
        },
      )

      setItems((current) => [
        ...current,
        ...nextItems,
      ])

      const validItems = nextItems.filter(
        (item) => item.state === "hashing",
      )

      if (validItems.length === 0) {
        return
      }

      setIsCheckingDuplicates(true)

      try {
        const hashedItems = await Promise.all(
          validItems.map(async (item) => ({
            ...item,
            fileHash:
              await calculateDocumentSha256(
                item.file,
              ),
          })),
        )

        setItems((current) =>
          current.map((item) => {
            const hashedItem =
              hashedItems.find(
                (candidate) =>
                  candidate.id === item.id,
              )

            return hashedItem
              ? {
                  ...item,
                  fileHash:
                    hashedItem.fileHash,
                  state: "checking",
                }
              : item
          }),
        )

        const candidates:
          DocumentDuplicateCandidate[] =
          hashedItems.map((item) => ({
            id: item.id,
            fileHash: item.fileHash,
          }))

        const matches =
          await findExactDocumentDuplicates(
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
          const existingHashes = new Set(
            current
              .filter(
                (item) =>
                  !hashedItems.some(
                    (hashedItem) =>
                      hashedItem.id ===
                      item.id,
                  ) &&
                  item.fileHash !== null &&
                  item.state !== "error" &&
                  item.state !== "skipped",
              )
              .map((item) => item.fileHash),
          )

          return current.map((item) => {
            const hashedItem =
              hashedItems.find(
                (candidate) =>
                  candidate.id === item.id,
              )

            if (!hashedItem) {
              return item
            }

            const databaseMatches =
              matchesByCandidate.get(
                item.id,
              ) ?? []
            const duplicateInQueue =
              existingHashes.has(
                hashedItem.fileHash,
              )

            existingHashes.add(
              hashedItem.fileHash,
            )

            if (
              databaseMatches.length > 0 ||
              duplicateInQueue
            ) {
              return {
                ...item,
                fileHash:
                  hashedItem.fileHash,
                state: "duplicate",
                errorMessage:
                  duplicateInQueue
                    ? "An exact copy is already in this upload queue."
                    : "An exact copy of this document already exists for this client.",
                duplicateDocuments:
                  databaseMatches,
              }
            }

            return {
              ...item,
              fileHash:
                hashedItem.fileHash,
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
              (candidate) =>
                candidate.id === item.id,
            )
              ? {
                  ...item,
                  state: "error",
                  errorMessage:
                    error instanceof Error
                      ? error.message
                      : "The document fingerprint could not be created.",
                }
              : item,
          ),
        )
      } finally {
        setIsCheckingDuplicates(false)
      }
    },
    [clientId, taxReturnId],
  )

  const removeItem = useCallback(
    (itemId: string) => {
      setItems((current) =>
        current.filter(
          (item) => item.id !== itemId,
        ),
      )
    },
    [],
  )

  const keepDuplicate = useCallback(
    (itemId: string) => {
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
    },
    [],
  )

  const skipDuplicate = useCallback(
    (itemId: string) => {
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
    },
    [],
  )

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
      (item) =>
        item.state === "queued" &&
        item.fileHash !== null,
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
          const document =
            await uploadClientDocument({
              clientId,
              taxReturnId,
              category,
              description,
              file: item.file,
              fileHash: item.fileHash ?? undefined,
              hashAlgorithm:
                SHA_256_ALGORITHM,
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
