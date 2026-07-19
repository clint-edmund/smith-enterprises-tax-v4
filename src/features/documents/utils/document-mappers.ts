import {
  documentCategories,
  documentStatuses,
  documentAccessActions,
} from "@/features/documents/types/document.types"

import type {
  ClientDocument,
  DocumentAccessAction,
  DocumentAccessLog,
  DocumentCategory,
  DocumentCategoryRecord,
  DocumentStatus,
} from "@/features/documents/types/document.types"

import type {
  ClientDocumentRow,
  DocumentAccessLogRow,
  DocumentCategoryRow,
} from "@/features/documents/types/document-row.types"

function isDocumentCategory(
  value: string,
): value is DocumentCategory {
  return documentCategories.some(
    category => category === value,
  )
}

function isDocumentStatus(
  value: string,
): value is DocumentStatus {
  return documentStatuses.some(
    status => status === value,
  )
}

function isDocumentAccessAction(
  value: string,
): value is DocumentAccessAction {
  return documentAccessActions.some(
    action => action === value,
  )
}

export function mapDocumentCategoryRow(
  row: DocumentCategoryRow,
): DocumentCategoryRecord {
  if (!isDocumentCategory(row.code)) {
    throw new Error(
      `Unsupported document category: ${row.code}`,
    )
  }

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapClientDocumentRow(
  row: ClientDocumentRow,
): ClientDocument {
  if (!isDocumentCategory(row.category)) {
    throw new Error(
      `Unsupported document category: ${row.category}`,
    )
  }

  if (!isDocumentStatus(row.status)) {
    throw new Error(
      `Unsupported document status: ${row.status}`,
    )
  }

  return {
    id: row.id,
    clientId: row.client_id,
    taxReturnId: row.tax_return_id,
    category: row.category,
    status: row.status,
    originalFileName:
      row.original_file_name,
    storageBucket:
      row.storage_bucket,
    storagePath:
      row.storage_path,
    mimeType:
      row.mime_type,
    sizeBytes:
      row.size_bytes,
    description:
      row.description,
    uploadedBy:
      row.uploaded_by,
    uploadedByName: null,
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at,
    archivedAt:
      row.archived_at,
  }
}

export function mapDocumentAccessLogRow(
  row: DocumentAccessLogRow,
): DocumentAccessLog {
  if (!isDocumentAccessAction(row.action)) {
    throw new Error(
      `Unsupported document access action: ${row.action}`,
    )
  }

  return {
    id: row.id,
    documentId: row.document_id,
    actorId: row.actor_id,
    action: row.action,
    occurredAt: row.occurred_at,
    details: row.details,
  }
}