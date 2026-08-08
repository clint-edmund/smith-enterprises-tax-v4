import { listClientDocuments } from "./document-service";

export interface DocumentMetrics {
  total: number;
  active: number;
  archived: number;

  /**
   * Temporary until the favorite service
   * is connected.
   */
  favorites: number;

  /**
   * Temporary until required document
   * tracking is connected.
   */
  missingRequired: number;
}

export async function getDocumentMetrics(
  clientId: string,
): Promise<DocumentMetrics> {
  const documents = await listClientDocuments(clientId);

  const archived = documents.filter(
    (document) => document.archivedAt !== null,
  ).length;

  return {
    total: documents.length,
    active: documents.length - archived,
    archived,

    favorites: documents.filter((document) => document.isFavorite).length,

    // Next phase
    missingRequired: 0,
  };
}
