export type DocumentActivityAction =
  | "document_uploaded"
  | "document_archived"
  | "document_downloaded"
  | "document_viewed"
  | "document_updated"
  | "document_status_changed"
  | "document_category_changed"
  | string;

export interface DocumentActivity {
  id: string;
  action: DocumentActivityAction;
  entityType: string;
  documentId: string;
  documentName: string;
  actorName: string;
  occurredAt: string;
  description: string;
}
