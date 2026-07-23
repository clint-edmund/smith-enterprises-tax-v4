import { supabase } from "@/services/supabase";
import type {
  ClientDocument,
  DocumentCategory,
  DocumentStatus,
  UploadDocumentRequest,
} from "@/features/documents/types/document.types";
import {
  DOCUMENT_BUCKET,
  sanitizeDocumentFileName,
  validateDocumentFile,
} from "@/features/documents/utils/document-utils";

interface DocumentDatabaseRow {
  id: string;
  client_id: string;
  tax_return_id: string | null;
  category: DocumentCategory;
  status: DocumentStatus;
  original_file_name: string;
  storage_bucket: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  description: string | null;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  is_favorite: boolean;
}

type DocumentRpcName =
  | "list_client_documents"
  | "register_client_document"
  | "archive_client_document"
  | "toggle_client_document_favorite";

type DocumentRpc = (
  functionName: DocumentRpcName,
  parameters?: Record<string, unknown>,
) => Promise<{
  data: unknown;
  error: { message: string } | null;
}>;

const documentRpc = supabase.rpc.bind(supabase) as unknown as DocumentRpc;

function mapDocumentRow(document: DocumentDatabaseRow): ClientDocument {
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
    description: document.description,
    uploadedBy: document.uploaded_by,
    uploadedByName: document.uploaded_by_name,
    createdAt: document.created_at,
    updatedAt: document.updated_at,
    archivedAt: document.archived_at ?? null,
    isFavorite: document.is_favorite,
  };
}

function createStoragePath(request: UploadDocumentRequest): string {
  const scope = request.taxReturnId
    ? `returns/${request.taxReturnId}`
    : "client";
  const uniquePrefix = crypto.randomUUID();
  const safeFileName = sanitizeDocumentFileName(request.file.name);

  return `${request.clientId}/${scope}/${uniquePrefix}-${safeFileName}`;
}

export async function listClientDocuments(
  clientId: string,
  taxReturnId?: string | null,
): Promise<ClientDocument[]> {
  const { data, error } = await documentRpc("list_client_documents", {
    requested_client_id: clientId,
    requested_tax_return_id: taxReturnId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DocumentDatabaseRow[]).map(mapDocumentRow);
}

export async function uploadClientDocument(
  request: UploadDocumentRequest,
): Promise<ClientDocument> {
  const validation = validateDocumentFile(request.file);

  if (!validation.isValid) {
    throw new Error(validation.errorMessage ?? "The document is invalid.");
  }

  const storagePath = createStoragePath(request);
  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(storagePath, request.file, {
      cacheControl: "3600",
      contentType: request.file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error: metadataError } = await documentRpc(
    "register_client_document",
    {
      requested_client_id: request.clientId,
      requested_tax_return_id: request.taxReturnId ?? null,
      requested_category: request.category,
      requested_original_file_name: request.file.name,
      requested_storage_bucket: DOCUMENT_BUCKET,
      requested_storage_path: storagePath,
      requested_mime_type: request.file.type,
      requested_size_bytes: request.file.size,
      requested_description: request.description?.trim() || null,
    },
  );

  if (metadataError) {
    await supabase.storage.from(DOCUMENT_BUCKET).remove([storagePath]);

    throw new Error(metadataError.message);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error(
      "The document uploaded, but its database record was not returned.",
    );
  }

  return mapDocumentRow(row as DocumentDatabaseRow);
}

export async function createDocumentDownloadUrl(
  document: ClientDocument,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(document.storageBucket)
    .createSignedUrl(document.storagePath, 60);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
}

export async function archiveClientDocument(documentId: string): Promise<void> {
  const { error } = await documentRpc("archive_client_document", {
    requested_document_id: documentId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleClientDocumentFavorite(
  documentId: string,
): Promise<ClientDocument> {
  const { data, error } = await documentRpc("toggle_client_document_favorite", {
    requested_document_id: documentId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error(
      "The document favorite status was updated, but the document record was not returned.",
    );
  }

  return mapDocumentRow(row as DocumentDatabaseRow);
}
