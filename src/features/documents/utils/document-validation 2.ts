import {
  allowedDocumentMimeTypes,
  maximumDocumentSizeBytes,
} from "@/features/documents/constants/document-constants"

export interface DocumentValidationResult {
  isValid: boolean
  errorMessage: string | null
}

export function validateDocumentFile(
  file: File,
): DocumentValidationResult {
  if (file.size <= 0) {
    return {
      isValid: false,
      errorMessage:
        "The selected file is empty.",
    }
  }

  if (
    file.size >
    maximumDocumentSizeBytes
  ) {
    return {
      isValid: false,
      errorMessage:
        "The selected file exceeds the 25 MB limit.",
    }
  }

  if (
    !allowedDocumentMimeTypes.includes(
      file.type as
        (typeof allowedDocumentMimeTypes)[number],
    )
  ) {
    return {
      isValid: false,
      errorMessage:
        "Only PDF, JPEG, PNG, and WebP files are allowed.",
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
  const trimmedFileName =
    fileName.trim()

  const sanitizedFileName =
    trimmedFileName
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

  return sanitizedFileName || "document"
}

export function getDocumentFileExtension(
  fileName: string,
): string {
  const lastPeriodIndex =
    fileName.lastIndexOf(".")

  if (
    lastPeriodIndex < 0 ||
    lastPeriodIndex ===
      fileName.length - 1
  ) {
    return ""
  }

  return fileName
    .slice(lastPeriodIndex + 1)
    .toLowerCase()
}

export function formatDocumentFileSize(
  sizeBytes: number,
): string {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`
  }

  const sizeKilobytes =
    sizeBytes / 1024

  if (sizeKilobytes < 1024) {
    return `${sizeKilobytes.toFixed(1)} KB`
  }

  const sizeMegabytes =
    sizeKilobytes / 1024

  return `${sizeMegabytes.toFixed(1)} MB`
}