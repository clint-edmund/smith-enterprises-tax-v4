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

type VersionedClientDocumentRow = ClientDocumentRow & {
  version_group_id?: string | null;
  version_number?: number | null;
  is_current_version?: boolean | null;
  previous_version_id?: string | null;
  version_notes?: string | null;

  review_status?:
    | "draft"
    | "pending_review"
    | "approved"
    | "needs_changes"
    | null;

  review_requested_by?: string | null;
  review_requested_at?: string | null;
  reviewed_by?: string | null;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
  review_comments?: string | null;
};

export function mapClientDocument(row: ClientDocumentRow): ClientDocument {
  if (!isDocumentStatus(row.status)) {
    throw new Error(`Unsupported document status: ${row.status}`);
  }

  const versionedRow = row as VersionedClientDocumentRow;

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
    fileHash: row.file_hash ?? null,
    hashAlgorithm: row.hash_algorithm ?? "SHA-256",
    description: row.description,
    uploadedBy: row.uploaded_by,
    uploadedByName: row.uploaded_by_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at ?? null,
    isFavorite: row.is_favorite ?? false,
    versionGroupId: versionedRow.version_group_id ?? row.id,
    versionNumber: Number(versionedRow.version_number ?? 1),
    isCurrentVersion: versionedRow.is_current_version ?? true,
    previousVersionId: versionedRow.previous_version_id ?? null,
    versionNotes: versionedRow.version_notes ?? null,
    reviewStatus: versionedRow.review_status ?? "draft",
    reviewRequestedBy: versionedRow.review_requested_by ?? null,
    reviewRequestedAt: versionedRow.review_requested_at ?? null,
    reviewedBy: versionedRow.reviewed_by ?? null,
    reviewedByName: versionedRow.reviewed_by_name ?? null,
    reviewedAt: versionedRow.reviewed_at ?? null,
    reviewComments: versionedRow.review_comments ?? null,
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
