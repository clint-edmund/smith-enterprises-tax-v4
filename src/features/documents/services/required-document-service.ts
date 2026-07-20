import { supabase } from "@/services/supabase";

import type {
  CompleteRequiredDocumentRequest,
  InitializeRequiredDocumentsResult,
  RequiredReturnDocument,
} from "../types/required-document.types";

function mapRequiredDocument(record: {
  id: string;
  tax_return_id: string;
  template_id: string | null;
  name: string;
  description: string | null;
  category: string;
  is_required: boolean;
  is_complete: boolean;
  matched_document_id: string | null;
  matched_document_name?: string | null;
  completed_at: string | null;
  completed_by: string | null;
  completed_by_name?: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}): RequiredReturnDocument {
  return {
    id: record.id,

    taxReturnId: record.tax_return_id,

    templateId: record.template_id,

    name: record.name,

    description: record.description,

    category: record.category,

    isRequired: record.is_required,

    isComplete: record.is_complete,

    matchedDocumentId: record.matched_document_id,

    matchedDocumentName: record.matched_document_name ?? null,

    completedAt: record.completed_at,

    completedBy: record.completed_by,

    completedByName: record.completed_by_name ?? null,

    notes: record.notes,

    sortOrder: record.sort_order,

    createdAt: record.created_at,

    updatedAt: record.updated_at,
  };
}

export async function initializeRequiredDocuments(
  taxReturnId: string,
): Promise<InitializeRequiredDocumentsResult> {
  const { data, error } = await supabase.rpc("initialize_required_documents", {
    requested_return_id: taxReturnId,
  });

  if (error) {
    throw error;
  }

  return {
    created: data ?? 0,
  };
}

export async function listRequiredDocuments(
  taxReturnId: string,
): Promise<RequiredReturnDocument[]> {
  const { data, error } = await supabase.rpc("list_required_documents", {
    requested_return_id: taxReturnId,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRequiredDocument);
}

export async function completeRequiredDocument(
  request: CompleteRequiredDocumentRequest,
): Promise<RequiredReturnDocument> {
  const { data, error } = await supabase.rpc("complete_required_document", {
    requested_required_document_id: request.requiredDocumentId,

    requested_document_id: request.documentId ?? undefined,

    requested_is_complete: request.isComplete,

    requested_notes: request.notes,
  });

  if (error) {
    throw error;
  }

  if (!data?.length) {
    throw new Error("Unable to update required document.");
  }

  return mapRequiredDocument(data[0]);
}
