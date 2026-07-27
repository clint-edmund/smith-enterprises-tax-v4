export const documentCategories = [
  "w2",
  "1099",
  "k1",
  "identification",
  "identity",
  "income",
  "deductions",
  "social_security",
  "prior_year_return",
  "engagement_letter",
  "organizer",
  "tax_organizer",
  "bank_document",
  "irs_notice",
  "state_notice",
  "completed_return",
  "tax_return",
  "supporting_document",
  "miscellaneous",
] as const;

export type DocumentCategory = (typeof documentCategories)[number];

export const documentCategoryLabels: Record<DocumentCategory, string> = {
  w2: "W-2",
  "1099": "1099",
  k1: "K-1",
  identification: "Identification",
  identity: "Identity",
  income: "Income",
  deductions: "Deductions",
  social_security: "Social Security",
  prior_year_return: "Prior-Year Return",
  engagement_letter: "Engagement Letter",
  organizer: "Tax Organizer",
  tax_organizer: "Tax Organizer",
  bank_document: "Bank Document",
  irs_notice: "IRS Notice",
  state_notice: "State Notice",
  completed_return: "Completed Return",
  tax_return: "Tax Return",
  supporting_document: "Supporting Document",
  miscellaneous: "Miscellaneous",
};

export const documentStatuses = [
  "uploaded",
  "under_review",
  "accepted",
  "rejected",
  "archived",
] as const;

export type DocumentStatus = (typeof documentStatuses)[number];

/**
 * A category record returned from the
 * document_categories database table.
 */

export const documentReviewStatuses = [
  "draft",
  "pending_review",
  "approved",
  "needs_changes",
] as const

export type DocumentReviewStatus =
  (typeof documentReviewStatuses)[number]


export const documentReviewerRoles = [
  "administrator",
  "manager",
  "reviewer",
] as const

export type DocumentReviewerRole =
  (typeof documentReviewerRoles)[number]

export interface DocumentReviewer {
  id: string
  displayName: string
  email: string
  role: DocumentReviewerRole
}

export interface AssignDocumentReviewRequest {
  documentId: string
  reviewerId: string
  reviewDueAt?: string | null
}

export interface DocumentCategoryRecord {
  id: string;
  code: DocumentCategory;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  taxReturnId: string | null;
  category: DocumentCategory;
  status: DocumentStatus;
  originalFileName: string;
  storageBucket: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  fileHash: string | null;
  hashAlgorithm: string;
  description: string | null;
  uploadedBy: string;
  uploadedByName: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  isFavorite: boolean;
  versionGroupId: string;
  versionNumber: number;
  isCurrentVersion: boolean;
  previousVersionId: string | null;
  versionNotes: string | null;
  reviewStatus: DocumentReviewStatus
  reviewRequestedBy: string | null
  reviewRequestedAt: string | null
  reviewedBy: string | null
  reviewedByName: string | null
  reviewedAt: string | null
  reviewComments: string | null
  assignedReviewerId: string | null
  assignedReviewerName: string | null
  reviewDueAt: string | null
}

export type ClientDocumentListItem = ClientDocument;

export interface UploadDocumentRequest {
  clientId: string;
  taxReturnId?: string | null;
  category: DocumentCategory;
  description?: string | null;
  file: File;
  fileHash?: string;
  hashAlgorithm?: string;
}

export interface UploadDocumentVersionRequest {
  document: ClientDocument;
  file: File;
  versionNotes?: string | null;
  fileHash?: string;
  hashAlgorithm?: string;
}

/**
 * Retains compatibility with the newer name.
 */
export type UploadClientDocumentInput = UploadDocumentRequest;

export interface UpdateClientDocumentInput {
  documentId: string;
  category?: DocumentCategory;
  status?: DocumentStatus;
  description?: string | null;
  originalFileName?: string;
}

export interface ClientDocumentFilters {
  clientId: string;
  taxReturnId?: string | null;
  category?: DocumentCategory;
  status?: DocumentStatus;
  includeArchived?: boolean;
}

export interface DocumentUploadResult {
  document: ClientDocument;
  storagePath: string;
}

export interface DocumentDownloadResult {
  signedUrl: string;
  expiresAt: string;
}

export const documentAccessActions = [
  "uploaded",
  "viewed",
  "downloaded",
  "renamed",
  "categorized",
  "status_changed",
  "deleted",
  "restored",
] as const;

export type DocumentAccessAction = (typeof documentAccessActions)[number];

export interface DocumentAccessLog {
  id: number;
  documentId: string;
  actorId: string | null;
  action: DocumentAccessAction;
  occurredAt: string;
  details: Record<string, unknown>;
}

export interface DocumentUploadValidation {
  isValid: boolean;
  errorMessage: string | null;
}

export type DocumentValidationResult = DocumentUploadValidation;

export interface DocumentUploadProgress {
  fileName: string;
  progress: number;
  status: "waiting" | "uploading" | "completed" | "failed";
  errorMessage?: string;
}
