export const documentCategories = [
  "identity",
  "income",
  "deductions",
  "business",
  "irs_notice",
  "prior_return",
  "engagement",
  "internal",
  "miscellaneous",
] as const

export type DocumentCategory =
  (typeof documentCategories)[number]

export const documentStatuses = [
  "uploaded",
  "verified",
  "rejected",
  "archived",
] as const

export type DocumentStatus =
  (typeof documentStatuses)[number]

export interface ClientDocument {
  id: string
  clientId: string
  taxReturnId: string | null
  category: DocumentCategory
  status: DocumentStatus
  originalFileName: string
  storageBucket: string
  storagePath: string
  mimeType: string
  sizeBytes: number
  description: string | null
  uploadedBy: string
  uploadedByName: string
  createdAt: string
  updatedAt: string
}

export interface UploadDocumentRequest {
  clientId: string
  taxReturnId?: string | null
  category: DocumentCategory
  description?: string
  file: File
}

export interface DocumentUploadValidation {
  isValid: boolean
  errorMessage: string | null
}
