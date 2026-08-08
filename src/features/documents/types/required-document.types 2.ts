import type { Database } from "@/types/database.types";

export type RequiredDocumentCategory =
  Database["public"]["Tables"]["required_document_templates"]["Row"]["category"];

export interface RequiredDocumentTemplate {
  id: string;

  name: string;

  description: string | null;

  category: RequiredDocumentCategory;

  returnType: Database["public"]["Enums"]["return_type"] | null;

  taxForm: Database["public"]["Enums"]["tax_form_type"] | null;

  isRequired: boolean;

  isActive: boolean;

  sortOrder: number;

  matchingKeywords: string[];

  createdAt: string;

  updatedAt: string;
}

export interface RequiredReturnDocument {
  id: string;

  taxReturnId: string;

  templateId: string | null;

  name: string;

  description: string | null;

  category: RequiredDocumentCategory;

  isRequired: boolean;

  isComplete: boolean;

  matchedDocumentId: string | null;

  matchedDocumentName: string | null;

  completedAt: string | null;

  completedBy: string | null;

  completedByName: string | null;

  notes: string | null;

  sortOrder: number;

  createdAt: string;

  updatedAt: string;
}

export interface RequiredDocumentProgress {
  total: number;

  completed: number;

  required: number;

  requiredCompleted: number;

  optional: number;

  optionalCompleted: number;

  percentComplete: number;
}

export interface InitializeRequiredDocumentsResult {
  created: number;
}

export interface CompleteRequiredDocumentRequest {
  requiredDocumentId: string;

  documentId?: string | null;

  isComplete: boolean;

  notes?: string;
}

export interface RequiredDocumentGroup {
  category: RequiredDocumentCategory;

  title: string;

  documents: RequiredReturnDocument[];
}
