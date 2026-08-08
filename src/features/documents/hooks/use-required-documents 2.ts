import { useCallback, useEffect, useMemo, useState } from "react";

import {
  completeRequiredDocument,
  initializeRequiredDocuments,
  listRequiredDocuments,
} from "../services/required-document-service";

import type {
  CompleteRequiredDocumentRequest,
  RequiredDocumentGroup,
  RequiredDocumentProgress,
  RequiredReturnDocument,
} from "../types/required-document.types";

interface UseRequiredDocumentsResult {
  requiredDocuments: RequiredReturnDocument[];

  groups: RequiredDocumentGroup[];

  progress: RequiredDocumentProgress;

  isLoading: boolean;

  isInitializing: boolean;

  isUpdating: boolean;

  error: string | null;

  initialize: () => Promise<number>;

  refresh: () => Promise<void>;

  updateRequiredDocument: (
    request: CompleteRequiredDocumentRequest,
  ) => Promise<RequiredReturnDocument>;
}

const CATEGORY_TITLES: Record<string, string> = {
  identity: "Identity Documents",
  income: "Income Documents",
  deductions: "Deduction Documents",
  business: "Business Documents",
  irs_notice: "IRS Notices",
  prior_return: "Prior Tax Returns",
  engagement: "Engagement Documents",
  internal: "Internal Documents",
  miscellaneous: "Miscellaneous Documents",
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function calculateProgress(
  documents: RequiredReturnDocument[],
): RequiredDocumentProgress {
  const total = documents.length;

  const completed = documents.filter((document) => document.isComplete).length;

  const requiredDocuments = documents.filter((document) => document.isRequired);

  const optionalDocuments = documents.filter(
    (document) => !document.isRequired,
  );

  const required = requiredDocuments.length;

  const requiredCompleted = requiredDocuments.filter(
    (document) => document.isComplete,
  ).length;

  const optional = optionalDocuments.length;

  const optionalCompleted = optionalDocuments.filter(
    (document) => document.isComplete,
  ).length;

  const percentComplete =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    required,
    requiredCompleted,
    optional,
    optionalCompleted,
    percentComplete,
  };
}

function groupRequiredDocuments(
  documents: RequiredReturnDocument[],
): RequiredDocumentGroup[] {
  const groupedDocuments = new Map<string, RequiredReturnDocument[]>();

  for (const document of documents) {
    const currentGroup = groupedDocuments.get(document.category) ?? [];

    currentGroup.push(document);

    groupedDocuments.set(document.category, currentGroup);
  }

  return Array.from(groupedDocuments.entries())
    .map(([category, categoryDocuments]) => ({
      category,
      title: CATEGORY_TITLES[category] ?? category,
      documents: [...categoryDocuments].sort((left, right) => {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }

        return left.name.localeCompare(right.name);
      }),
    }))
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function useRequiredDocuments(
  taxReturnId: string | undefined,
): UseRequiredDocumentsResult {
  const [requiredDocuments, setRequiredDocuments] = useState<
    RequiredReturnDocument[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isInitializing, setIsInitializing] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!taxReturnId) {
      setRequiredDocuments([]);
      setError(null);

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const documents = await listRequiredDocuments(taxReturnId);

      setRequiredDocuments(documents);
    } catch (caughtError) {
      setError(
        getErrorMessage(caughtError, "Unable to load required documents."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [taxReturnId]);

  const initialize = useCallback(async (): Promise<number> => {
    if (!taxReturnId) {
      throw new Error(
        "A tax return is required before documents can be initialized.",
      );
    }

    setIsInitializing(true);
    setError(null);

    try {
      const result = await initializeRequiredDocuments(taxReturnId);

      const documents = await listRequiredDocuments(taxReturnId);

      setRequiredDocuments(documents);

      return result.created;
    } catch (caughtError) {
      const message = getErrorMessage(
        caughtError,
        "Unable to initialize required documents.",
      );

      setError(message);

      throw caughtError;
    } finally {
      setIsInitializing(false);
    }
  }, [taxReturnId]);

  const updateRequiredDocument = useCallback(
    async (
      request: CompleteRequiredDocumentRequest,
    ): Promise<RequiredReturnDocument> => {
      setIsUpdating(true);
      setError(null);

      try {
        const updatedDocument = await completeRequiredDocument(request);

        setRequiredDocuments((currentDocuments) =>
          currentDocuments.map((document) =>
            document.id === updatedDocument.id ? updatedDocument : document,
          ),
        );

        return updatedDocument;
      } catch (caughtError) {
        const message = getErrorMessage(
          caughtError,
          "Unable to update required document.",
        );

        setError(message);

        throw caughtError;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!taxReturnId) {
      return;
    }

    const returnId = taxReturnId;

    async function load() {
      try {
        const documents = await listRequiredDocuments(returnId);

        setRequiredDocuments(documents);
        setError(null);
      } catch (caughtError) {
        setError(
          getErrorMessage(caughtError, "Unable to load required documents."),
        );
      }
    }

    void load();
  }, [taxReturnId]);

  const progress = useMemo(
    () => calculateProgress(requiredDocuments),
    [requiredDocuments],
  );

  const groups = useMemo(
    () => groupRequiredDocuments(requiredDocuments),
    [requiredDocuments],
  );

  return {
    requiredDocuments,
    groups,
    progress,
    isLoading,
    isInitializing,
    isUpdating,
    error,
    initialize,
    refresh,
    updateRequiredDocument,
  };
}
