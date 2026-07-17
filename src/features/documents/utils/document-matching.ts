import type { ClientDocument } from "../types/document.types";
import type {
  RequiredDocumentCategory,
  RequiredReturnDocument,
} from "../types/required-document.types";

export interface DocumentMatchCandidate {
  requiredDocumentId: string;
  clientDocumentId: string;
  score: number;
  reasons: string[];
}

const CATEGORY_KEYWORDS: Record<RequiredDocumentCategory, string[]> = {
  identity: [
    "driver",
    "license",
    "passport",
    "identity",
    "identification",
    "social security",
    "ssn",
  ],

  income: [
    "w2",
    "w-2",
    "1099",
    "income",
    "paystub",
    "pay stub",
    "interest",
    "dividend",
    "k1",
    "k-1",
  ],

  deductions: [
    "deduction",
    "mortgage",
    "charity",
    "donation",
    "medical",
    "tuition",
    "education",
    "property tax",
  ],

  business: [
    "business",
    "profit",
    "loss",
    "expense",
    "revenue",
    "schedule c",
    "1099-nec",
    "1099 nec",
  ],

  irs_notice: ["irs", "notice", "letter", "cp2000", "audit", "transcript"],

  prior_return: [
    "prior return",
    "tax return",
    "previous return",
    "1040",
    "1120",
    "1065",
  ],

  engagement: [
    "engagement",
    "agreement",
    "consent",
    "authorization",
    "signature",
  ],

  internal: ["internal", "worksheet", "review", "checklist", "notes"],

  miscellaneous: ["miscellaneous", "misc", "other", "supporting"],
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_\-./\\]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function includesPhrase(source: string, phrase: string): boolean {
  return normalizeText(source).includes(normalizeText(phrase));
}

function countSharedTokens(left: string, right: string): number {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));

  let shared = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      shared += 1;
    }
  }

  return shared;
}

function buildRequiredDocumentSearchText(
  requiredDocument: RequiredReturnDocument,
): string {
  return [
    requiredDocument.name,
    requiredDocument.description ?? "",
    requiredDocument.category,
  ].join(" ");
}

function buildClientDocumentSearchText(document: ClientDocument): string {
  return [
    document.originalFileName,
    document.description ?? "",
    document.category,
  ].join(" ");
}

export function calculateDocumentMatchScore(
  requiredDocument: RequiredReturnDocument,
  document: ClientDocument,
): DocumentMatchCandidate {
  const reasons: string[] = [];

  const requiredSearchText = buildRequiredDocumentSearchText(requiredDocument);

  const documentSearchText = buildClientDocumentSearchText(document);

  let score = 0;

  if (requiredDocument.category === document.category) {
    score += 40;

    reasons.push("Document category matches the checklist category.");
  }

  if (includesPhrase(document.originalFileName, requiredDocument.name)) {
    score += 40;

    reasons.push("File name contains the required document name.");
  }

  const sharedTokens = countSharedTokens(
    requiredSearchText,
    documentSearchText,
  );

  if (sharedTokens > 0) {
    const tokenScore = Math.min(sharedTokens * 8, 32);

    score += tokenScore;

    reasons.push(
      `${sharedTokens} matching search term${sharedTokens === 1 ? "" : "s"}.`,
    );
  }

  const categoryKeywords = CATEGORY_KEYWORDS[requiredDocument.category] ?? [];

  const matchingCategoryKeywords = categoryKeywords.filter((keyword) =>
    includesPhrase(documentSearchText, keyword),
  );

  if (matchingCategoryKeywords.length > 0) {
    const keywordScore = Math.min(matchingCategoryKeywords.length * 6, 24);

    score += keywordScore;

    reasons.push(
      `Matched category keyword${
        matchingCategoryKeywords.length === 1 ? "" : "s"
      }: ${matchingCategoryKeywords.join(", ")}.`,
    );
  }

  if (
    requiredDocument.isComplete &&
    requiredDocument.matchedDocumentId === document.id
  ) {
    score += 100;

    reasons.push("This document is already linked to the checklist item.");
  }

  return {
    requiredDocumentId: requiredDocument.id,

    clientDocumentId: document.id,

    score,

    reasons,
  };
}

export function findBestDocumentMatch(
  requiredDocument: RequiredReturnDocument,
  documents: ClientDocument[],
): DocumentMatchCandidate | null {
  const candidates = documents
    .filter((document) => document.status !== "archived")
    .map((document) => calculateDocumentMatchScore(requiredDocument, document))
    .sort((left, right) => right.score - left.score);

  const bestCandidate = candidates[0];

  if (!bestCandidate) {
    return null;
  }

  if (bestCandidate.score < 40) {
    return null;
  }

  return bestCandidate;
}

export function findDocumentMatches(
  requiredDocuments: RequiredReturnDocument[],
  documents: ClientDocument[],
): DocumentMatchCandidate[] {
  return requiredDocuments
    .filter((requiredDocument) => !requiredDocument.isComplete)
    .map((requiredDocument) =>
      findBestDocumentMatch(requiredDocument, documents),
    )
    .filter(
      (candidate): candidate is DocumentMatchCandidate => candidate !== null,
    )
    .sort((left, right) => right.score - left.score);
}
