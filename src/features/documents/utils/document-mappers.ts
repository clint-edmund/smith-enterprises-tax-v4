import type {
  ClientDocument,
  DocumentAccessAction,
  DocumentAccessLog,
  DocumentCategory,
  DocumentCategoryRecord,
  DocumentStatus,
} from "@/features/documents/types/document.types";

import type {
  ClientDocumentRow,
  DocumentAccessLogRow,
  DocumentCategoryRow,
} from "@/features/documents/types/document-row.types";

function isDocumentStatus(value: string): value is DocumentStatus {
  return [
    "uploaded",
    "under_review",
    "accepted",
    "rejected",
    "archived",
  ].includes(value);
}

function isDocumentAccessAction(value: string): value is DocumentAccessAction {
  return [
    "uploaded",
    "viewed",
    "downloaded",
    "renamed",
    "categorized",
    "status_changed",
    "deleted",
    "restored",
  ].includes(value);
}

export function mapDocumentCategory(
  row: DocumentCategoryRow,
): DocumentCategoryRecord {
  return {
    id: row.id,
    code: row.code as DocumentCategory,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapClientDocument(row: ClientDocumentRow): ClientDocument {
  if (!isDocumentStatus(row.status)) {
    throw new Error(`Unsupported document status: ${row.status}`);
  }

  return {
    id: row.id,
    clientId: row.client_id,
    taxReturnId: row.tax_return_id,
    category: row.category as DocumentCategory,
    status: row.status,
    originalFileName: row.original_file_name,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    description: row.description,
    uploadedBy: row.uploaded_by,
    uploadedByName: row.uploaded_by_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at ?? null,
    isFavorite: row.is_favorite ?? false,
  };
}

export function mapDocumentAccessLogRow(
  row: DocumentAccessLogRow,
): DocumentAccessLog {
  if (!isDocumentAccessAction(row.action)) {
    throw new Error(`Unsupported document access action: ${row.action}`);
  }

  return {
    id: row.id,
    documentId: row.document_id,
    actorId: row.actor_id,
    action: row.action,
    occurredAt: row.occurred_at,
    details: row.details,
  };
}
