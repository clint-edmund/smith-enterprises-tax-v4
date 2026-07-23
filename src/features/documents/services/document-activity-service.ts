import { supabase } from "@/services/supabase";

import type { DocumentActivity } from "@/features/documents/types/document-activity.types";

interface DocumentActivityDatabaseRow {
  id: string | number;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  document_name: string | null;
  actor_name: string | null;
  occurred_at: string;
  description: string | null;
}

type DocumentActivityRpc = (
  functionName: "get_client_document_activity",
  parameters: {
    requested_client_id: string;
    requested_limit: number;
  },
) => Promise<{
  data: unknown;
  error: {
    message: string;
  } | null;
}>;

const documentActivityRpc = supabase.rpc.bind(
  supabase,
) as unknown as DocumentActivityRpc;

function mapDocumentActivity(
  row: DocumentActivityDatabaseRow,
): DocumentActivity {
  return {
    id: String(row.id),
    action: row.action,
    entityType: row.entity_type ?? "document",
    documentId: row.entity_id ?? "",
    documentName: row.document_name?.trim() || "Unnamed document",
    actorName: row.actor_name?.trim() || "System",
    occurredAt: row.occurred_at,
    description:
      row.description?.trim() ||
      formatDocumentActivityDescription(row.action, row.document_name),
  };
}

function formatDocumentActivityDescription(
  action: string,
  documentName: string | null,
): string {
  const formattedAction = action.replace(/^document_/, "").replaceAll("_", " ");

  const formattedName = documentName?.trim() || "a document";

  return `${formattedAction} ${formattedName}`;
}

export async function listClientDocumentActivity(
  clientId: string,
  limit = 10,
): Promise<DocumentActivity[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  const { data, error } = await documentActivityRpc(
    "get_client_document_activity",
    {
      requested_client_id: clientId,
      requested_limit: safeLimit,
    },
  );

  if (error) {
    throw new Error(`Unable to load document activity: ${error.message}`);
  }

  return ((data ?? []) as DocumentActivityDatabaseRow[]).map(
    mapDocumentActivity,
  );
}
