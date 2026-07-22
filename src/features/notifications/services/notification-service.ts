import {
  supabase,
} from "@/services/supabase"

import type {
  Database,
} from "@/types/database.types"

import type {
  AppNotification,
  NotificationCategory,
  NotificationPriority,
} from "../types/notification.types"

type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"]

function mapNotificationRow(
  row: NotificationRow,
): AppNotification {
  return {
    id: row.id,

    title: row.title,

    message: row.message,

    category:
      row.category as NotificationCategory,

    priority:
      row.priority as NotificationPriority,

    isRead:
      row.is_read,

    isArchived:
      row.is_archived,

    createdAt:
      row.created_at,

    archivedAt:
      row.archived_at ??
      undefined,

    deletedAt:
      row.deleted_at ??
      undefined,

    actionUrl:
      row.action_url ??
      undefined,

    relatedEntityId:
      row.related_entity_id ??
      undefined,

    relatedEntityType:
      row.related_entity_type ??
      undefined,
  }
}

async function getAuthenticatedUserId():
Promise<string> {
  const {
    data,
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(
      error.message,
    )
  }

  if (!data.user) {
    throw new Error(
      "An authenticated user is required.",
    )
  }

  return data.user.id
}

function normalizeNotificationIds(
  notificationIds: string[],
): string[] {
  return Array.from(
    new Set(
      notificationIds
        .map((notificationId) =>
          notificationId.trim(),
        )
        .filter(Boolean),
    ),
  )
}

export async function getNotifications():
Promise<AppNotification[]> {
  const userId =
    await getAuthenticatedUserId()

  const {
    data,
    error,
  } = await supabase
    .from("notifications")
    .select("*")
    .eq(
      "recipient_user_id",
      userId,
    )
    .or(
      `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`,
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(250)

  if (error) {
    throw new Error(
      error.message,
    )
  }

  return (data ?? []).map(
    mapNotificationRow,
  )
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const normalizedId =
    notificationId.trim()

  if (!normalizedId) {
    throw new Error(
      "A notification identifier is required.",
    )
  }

  const userId =
    await getAuthenticatedUserId()

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      is_read: true,

      read_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      normalizedId,
    )
    .eq(
      "recipient_user_id",
      userId,
    )
    .is(
      "deleted_at",
      null,
    )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}

export async function markAllNotificationsRead():
Promise<void> {
  const userId =
    await getAuthenticatedUserId()

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      is_read: true,

      read_at:
        new Date().toISOString(),
    })
    .eq(
      "recipient_user_id",
      userId,
    )
    .eq(
      "is_read",
      false,
    )
    .eq(
      "is_archived",
      false,
    )
    .is(
      "deleted_at",
      null,
    )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}

export async function archiveNotifications(
  notificationIds: string[],
): Promise<void> {
  const normalizedIds =
    normalizeNotificationIds(
      notificationIds,
    )

  if (
    normalizedIds.length === 0
  ) {
    throw new Error(
      "At least one notification identifier is required.",
    )
  }

  const userId =
    await getAuthenticatedUserId()

  const archivedAt =
    new Date().toISOString()

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      is_archived: true,

      archived_at:
        archivedAt,
    })
    .eq(
      "recipient_user_id",
      userId,
    )
    .in(
      "id",
      normalizedIds,
    )
    .is(
      "deleted_at",
      null,
    )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}

export async function restoreNotifications(
  notificationIds: string[],
): Promise<void> {
  const normalizedIds =
    normalizeNotificationIds(
      notificationIds,
    )

  if (
    normalizedIds.length === 0
  ) {
    throw new Error(
      "At least one notification identifier is required.",
    )
  }

  const userId =
    await getAuthenticatedUserId()

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      is_archived: false,

      archived_at: null,
    })
    .eq(
      "recipient_user_id",
      userId,
    )
    .in(
      "id",
      normalizedIds,
    )
    .is(
      "deleted_at",
      null,
    )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}

export async function softDeleteNotifications(
  notificationIds: string[],
): Promise<void> {
  const normalizedIds =
    normalizeNotificationIds(
      notificationIds,
    )

  if (
    normalizedIds.length === 0
  ) {
    throw new Error(
      "At least one notification identifier is required.",
    )
  }

  const userId =
    await getAuthenticatedUserId()

  const deletedAt =
    new Date().toISOString()

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      deleted_at:
        deletedAt,
    })
    .eq(
      "recipient_user_id",
      userId,
    )
    .in(
      "id",
      normalizedIds,
    )
    .is(
      "deleted_at",
      null,
    )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}

export async function restoreDeletedNotifications(
  notificationIds: string[],
): Promise<void> {
  const normalizedIds =
    normalizeNotificationIds(
      notificationIds,
    )

  if (
    normalizedIds.length === 0
  ) {
    throw new Error(
      "At least one notification identifier is required.",
    )
  }

  const userId =
    await getAuthenticatedUserId()

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      deleted_at: null,
    })
    .eq(
      "recipient_user_id",
      userId,
    )
    .in(
      "id",
      normalizedIds,
    )
    .not(
      "deleted_at",
      "is",
      null,
    )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}

export async function clearNotifications():
Promise<void> {
  const userId =
    await getAuthenticatedUserId()

  const deletedAt =
    new Date().toISOString()

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      deleted_at:
        deletedAt,
    })
    .eq(
      "recipient_user_id",
      userId,
    )
    .is(
      "deleted_at",
      null,
    )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}