import { supabase } from "@/services/supabase"

import type {
  DocumentNotification,
  DocumentNotificationType,
} from "@/features/documents/types/document-notification.types"

interface DocumentNotificationRow {
  id: string
  notification_type: DocumentNotificationType
  title: string
  message: string
  document_id: string | null
  client_id: string | null
  tax_return_id: string | null
  metadata: Record<string, unknown> | null
  read_at: string | null
  created_at: string
}

type DocumentNotificationRpcName =
  | "list_my_document_notifications"
  | "get_my_unread_document_notification_count"
  | "mark_document_notification_read"
  | "mark_all_document_notifications_read"

type DocumentNotificationRpc = (
  functionName: DocumentNotificationRpcName,
  parameters?: Record<string, unknown>,
) => Promise<{
  data: unknown
  error: { message: string } | null
}>

const documentNotificationRpc =
  supabase.rpc.bind(
    supabase,
  ) as unknown as DocumentNotificationRpc

function mapDocumentNotification(
  row: DocumentNotificationRow,
): DocumentNotification {
  return {
    id: row.id,
    notificationType:
      row.notification_type,
    title: row.title,
    message: row.message,
    documentId: row.document_id,
    clientId: row.client_id,
    taxReturnId: row.tax_return_id,
    metadata: row.metadata ?? {},
    readAt: row.read_at,
    createdAt: row.created_at,
  }
}

export async function listMyDocumentNotifications(
  limit = 20,
): Promise<DocumentNotification[]> {
  const safeLimit = Math.min(
    Math.max(Math.trunc(limit), 1),
    100,
  )

  const { data, error } =
    await documentNotificationRpc(
      "list_my_document_notifications",
      {
        p_limit: safeLimit,
      },
    )

  if (error) {
    throw new Error(error.message)
  }

  return (
    (data ?? []) as DocumentNotificationRow[]
  ).map(mapDocumentNotification)
}

export async function getMyUnreadDocumentNotificationCount():
Promise<number> {
  const { data, error } =
    await documentNotificationRpc(
      "get_my_unread_document_notification_count",
    )

  if (error) {
    throw new Error(error.message)
  }

  return Number(data ?? 0)
}

export async function markDocumentNotificationRead(
  notificationId: string,
): Promise<void> {
  const normalizedId =
    notificationId.trim()

  if (!normalizedId) {
    throw new Error(
      "A notification identifier is required.",
    )
  }

  const { error } =
    await documentNotificationRpc(
      "mark_document_notification_read",
      {
        p_notification_id:
          normalizedId,
      },
    )

  if (error) {
    throw new Error(error.message)
  }
}

export async function markAllDocumentNotificationsRead():
Promise<number> {
  const { data, error } =
    await documentNotificationRpc(
      "mark_all_document_notifications_read",
    )

  if (error) {
    throw new Error(error.message)
  }

  return Number(data ?? 0)
}
