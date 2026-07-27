export const documentNotificationTypes = [
  "document_review_requested",
  "document_approved",
  "document_changes_requested",
  "document_review_reset",
  "document_review_reassigned",
  "document_review_overdue",
] as const

export type DocumentNotificationType =
  (typeof documentNotificationTypes)[number]

export interface DocumentNotification {
  id: string
  notificationType: DocumentNotificationType
  title: string
  message: string
  documentId: string | null
  clientId: string | null
  taxReturnId: string | null
  metadata: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

export interface DocumentNotificationSummary {
  notifications: DocumentNotification[]
  unreadCount: number
}
