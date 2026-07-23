import { useCallback } from "react";

import { toggleClientDocumentFavorite } from "@/features/documents/services/document-service";

interface UseDocumentFavoritesOptions {
  isFavorite: (documentId: string) => boolean;
  onFavoriteChanged: (documentId: string) => void;
}

export function useDocumentFavorites({
  isFavorite,
  onFavoriteChanged,
}: UseDocumentFavoritesOptions) {
  const toggleFavorite = useCallback(
    async (documentId: string) => {
      await toggleClientDocumentFavorite(documentId);

      onFavoriteChanged(documentId);
    },
    [onFavoriteChanged],
  );

  return {
    isFavorite,
    toggleFavorite,
  };
}
