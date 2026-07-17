import type {
  DocumentCategory,
  DocumentUploadValidation,
} from "@/features/documents/types/document.types"

export const DOCUMENT_BUCKET = "client-documents"
export const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
])

export const documentCategoryLabels: Record<
  DocumentCategory,
  string
> = {
  identity: "Identity",
  income: "Income",
  deductions: "Deductions",
  business: "Business",
  irs_notice: "IRS Notice",
  prior_return: "Prior Return",
  engagement: "Engagement",
  internal: "Internal",
  miscellaneous: "Miscellaneous",
}

export function validateDocumentFile(
  file: File,
): DocumentUploadValidation {
  if (file.size <= 0) {
    return {
      isValid: false,
      errorMessage: "The selected file is empty.",
    }
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return {
      isValid: false,
      errorMessage: "Documents must be 25 MB or smaller.",
    }
  }

  if (!allowedMimeTypes.has(file.type)) {
    return {
      isValid: false,
      errorMessage:
        "This file type is not supported. Upload PDF, JPG, PNG, HEIC, DOCX, XLSX, or ZIP files.",
    }
  }

  return {
    isValid: true,
    errorMessage: null,
  }
}

export function sanitizeDocumentFileName(
  fileName: string,
): string {
  const normalizedName = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  return normalizedName || "document"
}

export function formatDocumentSize(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}
