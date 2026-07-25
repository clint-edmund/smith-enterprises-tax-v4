import { logDocumentActivity } from "@/features/documents/services/document-activity-service"
import type {
  ClientDocument,
  DocumentCategory,
  DocumentReviewStatus,
  DocumentStatus,
  UploadDocumentRequest,
  UploadDocumentVersionRequest,
} from "@/features/documents/types/document.types"
import {
  calculateDocumentSha256,
  SHA_256_ALGORITHM,
} from "@/features/documents/utils/document-hash"
import {
  DOCUMENT_BUCKET,
  sanitizeDocumentFileName,
  validateDocumentFile,
} from "@/features/documents/utils/document-utils"
import { supabase } from "@/services/supabase"

interface DocumentDatabaseRow {
  id: string
  client_id: string
  tax_return_id: string | null
  category: DocumentCategory
  status: DocumentStatus
  original_file_name: string
  storage_bucket: string
  storage_path: string
  mime_type: string
  size_bytes: number
  file_hash: string | null
  hash_algorithm: string
  description: string | null
  uploaded_by: string
  uploaded_by_name: string | null
  created_at: string
  updated_at: string
  archived_at?: string | null
  is_favorite?: boolean
  version_group_id?: string | null
  version_number?: number | null
  is_current_version?: boolean | null
  previous_version_id?: string | null
  version_notes?: string | null
  review_status?: DocumentReviewStatus | null
  review_requested_by?: string | null
  review_requested_at?: string | null
  reviewed_by?: string | null
  reviewed_by_name?: string | null
  reviewed_at?: string | null
  review_comments?: string | null
}

interface DocumentHashMatchRow {
  id: string
  original_file_name: string
  created_at: string
  category: DocumentCategory
  size_bytes: number
}

type DocumentRpcName =
  | "list_client_documents"
  | "register_client_document"
  | "find_matching_document_hash"
  | "archive_client_document"
  | "toggle_client_document_favorite"
  | "create_document_version"
  | "list_document_versions"
  | "restore_document_version"
  | "request_document_review"
  | "approve_document"
  | "request_document_changes"
  | "reset_document_review" 

type DocumentRpc = (
  functionName: DocumentRpcName,
  parameters?: Record<string, unknown>,
) => Promise<{
  data: unknown
  error: { message: string } | null
}>

const documentRpc =
  supabase.rpc.bind(supabase) as unknown as DocumentRpc

function mapDocumentRow(
  document: DocumentDatabaseRow,
): ClientDocument {
  return {
    id: document.id,
    clientId: document.client_id,
    taxReturnId: document.tax_return_id,
    category: document.category,
    status: document.status,
    originalFileName: document.original_file_name,
    storageBucket: document.storage_bucket,
    storagePath: document.storage_path,
    mimeType: document.mime_type,
    sizeBytes: Number(document.size_bytes),
    fileHash: document.file_hash,
    hashAlgorithm:
      document.hash_algorithm || SHA_256_ALGORITHM,
    description: document.description,
    uploadedBy: document.uploaded_by,
    uploadedByName: document.uploaded_by_name,
    createdAt: document.created_at,
    updatedAt: document.updated_at,
    archivedAt: document.archived_at ?? null,
    isFavorite: document.is_favorite ?? false,
    versionGroupId: document.version_group_id ?? document.id,
    versionNumber: Number(document.version_number ?? 1),
    isCurrentVersion: document.is_current_version ?? true,
    previousVersionId: document.previous_version_id ?? null,
    versionNotes: document.version_notes ?? null,
    reviewStatus: document.review_status ?? "draft",
    reviewRequestedBy: document.review_requested_by ?? null,
    reviewRequestedAt: document.review_requested_at ?? null,
    reviewedBy: document.reviewed_by ?? null,
    reviewedByName: document.reviewed_by_name ?? null,
    reviewedAt: document.reviewed_at ?? null,
    reviewComments: document.review_comments ?? null,
  }
}

function createStoragePath(
  request: UploadDocumentRequest,
): string {
  const scope = request.taxReturnId
    ? `returns/${request.taxReturnId}`
    : "client"
  const uniquePrefix = crypto.randomUUID()
  const safeFileName =
    sanitizeDocumentFileName(request.file.name)

  return `${request.clientId}/${scope}/${uniquePrefix}-${safeFileName}`
}

function createVersionStoragePath(
  request: UploadDocumentVersionRequest,
): string {
  const scope = request.document.taxReturnId
    ? `returns/${request.document.taxReturnId}`
    : "client"
  const uniquePrefix = crypto.randomUUID()
  const safeFileName =
    sanitizeDocumentFileName(request.file.name)

  return `${request.document.clientId}/${scope}/versions/${uniquePrefix}-${safeFileName}`
}

export async function listClientDocuments(
  clientId: string,
  taxReturnId?: string | null,
): Promise<ClientDocument[]> {
  const { data, error } = await documentRpc(
    "list_client_documents",
    {
      requested_client_id: clientId,
      requested_tax_return_id: taxReturnId ?? null,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as DocumentDatabaseRow[]).map(
    mapDocumentRow,
  )
}

export interface ExactDocumentDuplicate {
  id: string
  originalFileName: string
  createdAt: string
  category: DocumentCategory
  sizeBytes: number
}

export interface DocumentDuplicateCandidate {
  id: string
  fileHash: string
}

export interface DocumentDuplicateMatch {
  candidateId: string
  documents: ExactDocumentDuplicate[]
}

export async function findExactDocumentDuplicates(
  clientId: string,
  taxReturnId: string | null,
  candidates: DocumentDuplicateCandidate[],
): Promise<DocumentDuplicateMatch[]> {
  return Promise.all(
    candidates.map(async (candidate) => {
      const { data, error } = await documentRpc(
        "find_matching_document_hash",
        {
          requested_client_id: clientId,
          requested_tax_return_id: taxReturnId,
          requested_file_hash: candidate.fileHash,
        },
      )

      if (error) {
        throw new Error(error.message)
      }

      const documents = (
        (data ?? []) as DocumentHashMatchRow[]
      ).map<ExactDocumentDuplicate>((document) => ({
        id: document.id,
        originalFileName: document.original_file_name,
        createdAt: document.created_at,
        category: document.category,
        sizeBytes: Number(document.size_bytes),
      }))

      return {
        candidateId: candidate.id,
        documents,
      }
    }),
  )
}

export async function uploadClientDocument(
  request: UploadDocumentRequest,
): Promise<ClientDocument> {
  const validation = validateDocumentFile(request.file)

  if (!validation.isValid) {
    throw new Error(
      validation.errorMessage ?? "The document is invalid.",
    )
  }

  const fileHash =
    request.fileHash ??
    (await calculateDocumentSha256(request.file))
  const hashAlgorithm =
    request.hashAlgorithm ?? SHA_256_ALGORITHM
  const storagePath = createStoragePath(request)

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(storagePath, request.file, {
      cacheControl: "3600",
      contentType: request.file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data, error: metadataError } = await documentRpc(
    "register_client_document",
    {
      requested_client_id: request.clientId,
      requested_tax_return_id:
        request.taxReturnId ?? null,
      requested_category: request.category,
      requested_original_file_name: request.file.name,
      requested_storage_bucket: DOCUMENT_BUCKET,
      requested_storage_path: storagePath,
      requested_mime_type: request.file.type,
      requested_size_bytes: request.file.size,
      requested_description:
        request.description?.trim() || null,
      requested_file_hash: fileHash,
      requested_hash_algorithm: hashAlgorithm,
    },
  )

  if (metadataError) {
    await supabase.storage
      .from(DOCUMENT_BUCKET)
      .remove([storagePath])

    throw new Error(metadataError.message)
  }

  const row = Array.isArray(data) ? data[0] : data

  if (!row) {
    throw new Error(
      "The document uploaded, but its database record was not returned.",
    )
  }

  const document = mapDocumentRow(
    row as DocumentDatabaseRow,
  )

  await logDocumentActivity({
    documentId: document.id,
    clientId: document.clientId,
    action: "document_uploaded",
    details: `Uploaded "${document.originalFileName}".`,
    metadata: {
      fileName: document.originalFileName,
      category: document.category,
      fileHash: document.fileHash,
      hashAlgorithm: document.hashAlgorithm,
    },
  })

  return document
}

export async function listDocumentVersions(
  documentId: string,
): Promise<ClientDocument[]> {
  const { data, error } = await documentRpc(
    "list_document_versions",
    {
      requested_document_id: documentId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as DocumentDatabaseRow[]).map(
    mapDocumentRow,
  )
}

export async function uploadDocumentVersion(
  request: UploadDocumentVersionRequest,
): Promise<ClientDocument> {
  const validation = validateDocumentFile(request.file)

  if (!validation.isValid) {
    throw new Error(
      validation.errorMessage ?? "The document is invalid.",
    )
  }

  const fileHash =
    request.fileHash ??
    (await calculateDocumentSha256(request.file))
  const hashAlgorithm =
    request.hashAlgorithm ?? SHA_256_ALGORITHM
  const storagePath = createVersionStoragePath(request)

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(storagePath, request.file, {
      cacheControl: "3600",
      contentType: request.file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data, error: metadataError } = await documentRpc(
    "create_document_version",
    {
      requested_document_id: request.document.id,
      requested_original_file_name: request.file.name,
      requested_storage_bucket: DOCUMENT_BUCKET,
      requested_storage_path: storagePath,
      requested_mime_type: request.file.type,
      requested_size_bytes: request.file.size,
      requested_version_notes:
        request.versionNotes?.trim() || null,
      requested_file_hash: fileHash,
      requested_hash_algorithm: hashAlgorithm,
    },
  )

  if (metadataError) {
    await supabase.storage
      .from(DOCUMENT_BUCKET)
      .remove([storagePath])

    throw new Error(metadataError.message)
  }

  const row = Array.isArray(data) ? data[0] : data

  if (!row) {
    throw new Error(
      "The new version uploaded, but its database record was not returned.",
    )
  }

  const document = mapDocumentRow(
    row as DocumentDatabaseRow,
  )

  await logDocumentActivity({
    documentId: document.id,
    clientId: document.clientId,
    action: "document_version_created",
    details:
      `Created version ${document.versionNumber} of "${document.originalFileName}".`,
    metadata: {
      versionGroupId: document.versionGroupId,
      versionNumber: document.versionNumber,
      previousVersionId: document.previousVersionId,
      versionNotes: document.versionNotes,
      fileHash: document.fileHash,
      hashAlgorithm: document.hashAlgorithm,
    },
  })

  return document
}

export async function restoreDocumentVersion(
  documentId: string,
): Promise<ClientDocument> {
  const { data, error } = await documentRpc(
    "restore_document_version",
    {
      requested_document_id: documentId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  const row = Array.isArray(data) ? data[0] : data

  if (!row) {
    throw new Error(
      "The version was restored, but its document record was not returned.",
    )
  }

  const document = mapDocumentRow(
    row as DocumentDatabaseRow,
  )

  await logDocumentActivity({
    documentId: document.id,
    clientId: document.clientId,
    action: "document_version_restored",
    details:
      `Restored version ${document.versionNumber} of "${document.originalFileName}".`,
    metadata: {
      versionGroupId: document.versionGroupId,
      versionNumber: document.versionNumber,
    },
  })

  return document
}

export async function createDocumentDownloadUrl(
  document: ClientDocument,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(document.storageBucket)
    .createSignedUrl(document.storagePath, 60)

  if (error) {
    throw new Error(error.message)
  }

  return data.signedUrl
}

export async function archiveClientDocument(
  documentId: string,
): Promise<void> {
  const { error } = await documentRpc(
    "archive_client_document",
    {
      requested_document_id: documentId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }
}

export async function toggleClientDocumentFavorite(
  documentId: string,
): Promise<ClientDocument> {
  const { data, error } = await documentRpc(
    "toggle_client_document_favorite",
    {
      requested_document_id: documentId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  const row = Array.isArray(data) ? data[0] : data

  if (!row) {
    throw new Error(
      "The document favorite status was updated, but the document record was not returned.",
    )
  }

  const document = mapDocumentRow(
    row as DocumentDatabaseRow,
  )

  await logDocumentActivity({
    documentId: document.id,
    clientId: document.clientId,
    action: document.isFavorite
      ? "document_favorite_added"
      : "document_favorite_removed",
    details: document.isFavorite
      ? `Marked "${document.originalFileName}" as a favorite.`
      : `Removed "${document.originalFileName}" from favorites.`,
    metadata: {
      fileName: document.originalFileName,
      isFavorite: document.isFavorite,
    },
  })

  return document
}
export async function requestDocumentReview(
  documentId: string,
): Promise<ClientDocument> {
  const { data, error } = await documentRpc(
    "request_document_review",
    {
      p_document_id: documentId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  const row = Array.isArray(data) ? data[0] : data

  if (!row) {
    throw new Error(
      "The document was submitted for review, but the updated record was not returned.",
    )
  }

  const document = mapDocumentRow(
    row as DocumentDatabaseRow,
  )

  await logDocumentActivity({
    documentId: document.id,
    clientId: document.clientId,
    action: "document_review_requested",
    details:
      `Submitted "${document.originalFileName}" for review.`,
    metadata: {
      reviewStatus: document.reviewStatus,
      reviewRequestedAt: document.reviewRequestedAt,
    },
  })

  return document
}

export async function approveDocument(
  documentId: string,
  reviewerName: string,
  comments?: string | null,
): Promise<ClientDocument> {
  const { data, error } = await documentRpc(
    "approve_document",
    {
      p_document_id: documentId,
      p_reviewer_name: reviewerName.trim(),
      p_comments: comments?.trim() || null,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  const row = Array.isArray(data) ? data[0] : data

  if (!row) {
    throw new Error(
      "The document was approved, but the updated record was not returned.",
    )
  }

  const document = mapDocumentRow(
    row as DocumentDatabaseRow,
  )

  await logDocumentActivity({
    documentId: document.id,
    clientId: document.clientId,
    action: "document_approved",
    details:
      `Approved "${document.originalFileName}".`,
    metadata: {
      reviewStatus: document.reviewStatus,
      reviewedBy: document.reviewedBy,
      reviewedByName: document.reviewedByName,
      reviewedAt: document.reviewedAt,
      reviewComments: document.reviewComments,
    },
  })

  return document
}

export async function requestDocumentChanges(
  documentId: string,
  reviewerName: string,
  comments: string,
): Promise<ClientDocument> {
  const normalizedComments = comments.trim()

  if (!normalizedComments) {
    throw new Error(
      "Review comments are required when requesting changes.",
    )
  }

  const { data, error } = await documentRpc(
    "request_document_changes",
    {
      p_document_id: documentId,
      p_reviewer_name: reviewerName.trim(),
      p_comments: normalizedComments,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  const row = Array.isArray(data) ? data[0] : data

  if (!row) {
    throw new Error(
      "Changes were requested, but the updated document record was not returned.",
    )
  }

  const document = mapDocumentRow(
    row as DocumentDatabaseRow,
  )

  await logDocumentActivity({
    documentId: document.id,
    clientId: document.clientId,
    action: "document_changes_requested",
    details:
      `Requested changes for "${document.originalFileName}".`,
    metadata: {
      reviewStatus: document.reviewStatus,
      reviewedBy: document.reviewedBy,
      reviewedByName: document.reviewedByName,
      reviewedAt: document.reviewedAt,
      reviewComments: document.reviewComments,
    },
  })

  return document
}

export async function resetDocumentReview(
  documentId: string,
): Promise<ClientDocument> {
  const { data, error } = await documentRpc(
    "reset_document_review",
    {
      p_document_id: documentId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  const row = Array.isArray(data) ? data[0] : data

  if (!row) {
    throw new Error(
      "The document review state was reset, but the updated record was not returned.",
    )
  }

  const document = mapDocumentRow(
    row as DocumentDatabaseRow,
  )

  await logDocumentActivity({
    documentId: document.id,
    clientId: document.clientId,
    action: "document_review_reset",
    details:
      `Reset the review status for "${document.originalFileName}".`,
    metadata: {
      reviewStatus: document.reviewStatus,
    },
  })

  return document
}