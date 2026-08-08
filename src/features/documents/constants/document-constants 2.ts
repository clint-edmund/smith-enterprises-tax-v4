export const clientDocumentBucket =
  "client-documents"

export const maximumDocumentSizeBytes =
  25 * 1024 * 1024

export const allowedDocumentMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export const signedDocumentUrlLifetimeSeconds =
  60 * 5