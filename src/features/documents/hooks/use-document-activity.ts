import { useCallback, useEffect, useState } from "react";

import { listClientDocumentActivity } from "@/features/documents/services/document-activity-service";

import type { DocumentActivity } from "@/features/documents/types/document-activity.types";

interface UseDocumentActivityResult {
  activities: DocumentActivity[];
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
}

export function useDocumentActivity(
  clientId: string | null,
  limit = 10,
): UseDocumentActivityResult {
  const [activities, setActivities] = useState<DocumentActivity[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadActivity = useCallback(
    async (showRefreshIndicator = false): Promise<void> => {
      if (!clientId) {
        setActivities([]);
        setErrorMessage(null);
        setIsLoading(false);
        setIsRefreshing(false);

        return;
      }

      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const results = await listClientDocumentActivity(clientId, limit);

        setActivities(results);
      } catch (error) {
        console.error("Unable to load document activity:", error);

        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";

        setActivities([]);
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [clientId, limit],
  );

  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      if (!clientId) {
        setActivities([]);
        setErrorMessage(null);
        setIsLoading(false);

        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const results = await listClientDocumentActivity(clientId, limit);

        if (!cancelled) {
          setActivities(results);
        }
      } catch (error) {
        console.error("Unable to load document activity:", error);

        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.";

          setActivities([]);
          setErrorMessage(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [clientId, limit]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadActivity(true);
  }, [loadActivity]);

  return {
    activities,
    isLoading,
    isRefreshing,
    errorMessage,
    refresh,
  };
}
