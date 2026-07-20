import type { ClientDocument } from "../types/document.types";
import type {
  RequiredDocumentCategory,
  RequiredReturnDocument,
} from "../types/required-document.types";

export type DocumentMatchConfidence = "high" | "medium" | "low";

export interface DocumentMatchCandidate {
  requiredDocumentId: string;
  clientDocumentId: string;
  score: number;
  confidencePercent: number;
  confidence: DocumentMatchConfidence;
  reasons: string[];
}

interface DocumentAliasGroup {
  label: string;
  aliases: string[];
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

const DOCUMENT_ALIAS_GROUPS: DocumentAliasGroup[] = [
  {
    label: "W-2",
    aliases: [
      "w2",
      "w-2",
      "w 2",
      "form w2",
      "form w-2",
      "wage and tax statement",
      "employee wage statement",
      "wage statement",
    ],
  },
  {
    label: "1099-INT",
    aliases: [
      "1099-int",
      "1099 int",
      "form 1099-int",
      "interest income",
      "interest statement",
    ],
  },
  {
    label: "1099-DIV",
    aliases: [
      "1099-div",
      "1099 div",
      "form 1099-div",
      "dividend income",
      "dividend statement",
    ],
  },
  {
    label: "1099-NEC",
    aliases: [
      "1099-nec",
      "1099 nec",
      "form 1099-nec",
      "nonemployee compensation",
      "contractor income",
    ],
  },
  {
    label: "1099-MISC",
    aliases: [
      "1099-misc",
      "1099 misc",
      "form 1099-misc",
      "miscellaneous income",
    ],
  },
  {
    label: "1099-R",
    aliases: [
      "1099-r",
      "1099 r",
      "form 1099-r",
      "retirement distribution",
      "pension distribution",
    ],
  },
  {
    label: "SSA-1099",
    aliases: [
      "ssa-1099",
      "ssa 1099",
      "social security benefit statement",
      "social security benefits",
    ],
  },
  {
    label: "K-1",
    aliases: [
      "k1",
      "k-1",
      "k 1",
      "schedule k1",
      "schedule k-1",
      "partner share",
      "shareholder share",
      "beneficiary share",
    ],
  },
  {
    label: "Form 1098",
    aliases: [
      "1098",
      "form 1098",
      "mortgage interest statement",
      "mortgage interest",
    ],
  },
  {
    label: "Form 1098-T",
    aliases: [
      "1098-t",
      "1098 t",
      "form 1098-t",
      "tuition statement",
      "education tuition",
    ],
  },
  {
    label: "Driver License",
    aliases: [
      "driver license",
      "drivers license",
      "driver's license",
      "driving license",
      "dl",
      "license front",
      "license back",
    ],
  },
  {
    label: "Social Security Card",
    aliases: ["social security card", "ss card", "ssn card", "social security"],
  },
  {
    label: "Passport",
    aliases: ["passport", "passport card", "passport photo page"],
  },
  {
    label: "Prior Tax Return",
    aliases: [
      "prior tax return",
      "previous tax return",
      "last year return",
      "prior return",
      "tax return",
      "1040",
    ],
  },
  {
    label: "IRS Notice",
    aliases: [
      "irs notice",
      "irs letter",
      "tax notice",
      "cp2000",
      "audit letter",
    ],
  },
  {
    label: "Engagement Letter",
    aliases: [
      "engagement letter",
      "engagement agreement",
      "tax preparation agreement",
      "client agreement",
    ],
  },
];

function calculateConfidence(score: number): {
  confidencePercent: number;
  confidence: DocumentMatchConfidence;
} {
  const confidencePercent = Math.min(Math.max(Math.round(score), 0), 100);

  if (confidencePercent >= 85) {
    return {
      confidencePercent,
      confidence: "high",
    };
  }

  if (confidencePercent >= 60) {
    return {
      confidencePercent,
      confidence: "medium",
    };
  }

  return {
    confidencePercent,
    confidence: "low",
  };
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[_\-./\\]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(value: string): string {
  return normalizeText(value).replace(/\s+/g, "");
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function includesPhrase(source: string, phrase: string): boolean {
  const normalizedSource = normalizeText(source);
  const normalizedPhrase = normalizeText(phrase);

  if (!normalizedPhrase) {
    return false;
  }

  if (normalizedSource.includes(normalizedPhrase)) {
    return true;
  }

  return compactText(source).includes(compactText(phrase));
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

function findApplicableAliasGroups(
  requiredSearchText: string,
): DocumentAliasGroup[] {
  return DOCUMENT_ALIAS_GROUPS.filter((group) =>
    group.aliases.some((alias) => includesPhrase(requiredSearchText, alias)),
  );
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

  const applicableAliasGroups = findApplicableAliasGroups(requiredSearchText);

  for (const aliasGroup of applicableAliasGroups) {
    const matchedAlias = aliasGroup.aliases.find((alias) =>
      includesPhrase(documentSearchText, alias),
    );

    if (matchedAlias) {
      score += 55;

      reasons.push(`Recognized ${aliasGroup.label} from "${matchedAlias}".`);

      break;
    }
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

  const { confidencePercent, confidence } = calculateConfidence(score);

  return {
    requiredDocumentId: requiredDocument.id,
    clientDocumentId: document.id,
    score,
    confidencePercent,
    confidence,
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
