import {
  supabase,
} from "@/services/supabase"

import type {
  Database,
} from "@/types/database.types"

import type {
  NotificationPreferences,
  NotificationPreferenceUpdates,
} from "../types/notification-preference.types"

type NotificationPreferenceRow =
  Database["public"]["Tables"]["notification_preferences"]["Row"]

type NotificationPreferenceInsert =
  Database["public"]["Tables"]["notification_preferences"]["Insert"]

type NotificationPreferenceUpdate =
  Database["public"]["Tables"]["notification_preferences"]["Update"]

const defaultPreferenceValues: NotificationPreferenceUpdates = {
  assignmentNotifications: true,
  clientNotifications: true,
  returnNotifications: true,
  paymentNotifications: true,
  systemNotifications: true,
  highPriorityNotifications: true,
  securityNotifications: true,
  browserNotifications: false,
  emailNotifications: false,
  dailyDigest: false,
  weeklyDigest: false,
  quietHoursEnabled: false,
  quietHoursStart: undefined,
  quietHoursEnd: undefined,
  badgeCounter: true,
  notificationSound: true,
  desktopToasts: true,
  autoMarkRead: false,
  retentionDays: 90,
}

function mapPreferenceRow(
  row: NotificationPreferenceRow,
): NotificationPreferences {
  return {
    id: row.id,

    userId: row.user_id,

    assignmentNotifications:
      row.assignment_notifications,

    clientNotifications:
      row.client_notifications,

    returnNotifications:
      row.return_notifications,

    paymentNotifications:
      row.payment_notifications,

    systemNotifications:
      row.system_notifications,

    highPriorityNotifications:
      row.high_priority_notifications,

    securityNotifications:
      row.security_notifications,

    browserNotifications:
      row.browser_notifications,

    emailNotifications:
      row.email_notifications,

    dailyDigest:
      row.daily_digest,

    weeklyDigest:
      row.weekly_digest,

    quietHoursEnabled:
      row.quiet_hours_enabled,

    quietHoursStart:
      row.quiet_hours_start ??
      undefined,

    quietHoursEnd:
      row.quiet_hours_end ??
      undefined,

    badgeCounter:
      row.badge_counter,

    notificationSound:
      row.notification_sound,

    desktopToasts:
      row.desktop_toasts,

    autoMarkRead:
      row.auto_mark_read,

    retentionDays:
      row.retention_days,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

async function getAuthenticatedUserId():
Promise<string> {
  const {
    data,
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error(
      "An authenticated user is required.",
    )
  }

  return data.user.id
}

function createInsertPayload(
  userId: string,
): NotificationPreferenceInsert {
  return {
    user_id: userId,

    assignment_notifications:
      defaultPreferenceValues
        .assignmentNotifications,

    client_notifications:
      defaultPreferenceValues
        .clientNotifications,

    return_notifications:
      defaultPreferenceValues
        .returnNotifications,

    payment_notifications:
      defaultPreferenceValues
        .paymentNotifications,

    system_notifications:
      defaultPreferenceValues
        .systemNotifications,

    high_priority_notifications:
      defaultPreferenceValues
        .highPriorityNotifications,

    security_notifications:
      defaultPreferenceValues
        .securityNotifications,

    browser_notifications:
      defaultPreferenceValues
        .browserNotifications,

    email_notifications:
      defaultPreferenceValues
        .emailNotifications,

    daily_digest:
      defaultPreferenceValues
        .dailyDigest,

    weekly_digest:
      defaultPreferenceValues
        .weeklyDigest,

    quiet_hours_enabled:
      defaultPreferenceValues
        .quietHoursEnabled,

    quiet_hours_start: null,

    quiet_hours_end: null,

    badge_counter:
      defaultPreferenceValues
        .badgeCounter,

    notification_sound:
      defaultPreferenceValues
        .notificationSound,

    desktop_toasts:
      defaultPreferenceValues
        .desktopToasts,

    auto_mark_read:
      defaultPreferenceValues
        .autoMarkRead,

    retention_days:
      defaultPreferenceValues
        .retentionDays,
  }
}

function createUpdatePayload(
  updates: NotificationPreferenceUpdates,
): NotificationPreferenceUpdate {
  return {
    assignment_notifications:
      updates.assignmentNotifications,

    client_notifications:
      updates.clientNotifications,

    return_notifications:
      updates.returnNotifications,

    payment_notifications:
      updates.paymentNotifications,

    system_notifications:
      updates.systemNotifications,

    high_priority_notifications:
      updates.highPriorityNotifications,

    security_notifications:
      updates.securityNotifications,

    browser_notifications:
      updates.browserNotifications,

    email_notifications:
      updates.emailNotifications,

    daily_digest:
      updates.dailyDigest,

    weekly_digest:
      updates.weeklyDigest,

    quiet_hours_enabled:
      updates.quietHoursEnabled,

    quiet_hours_start:
      updates.quietHoursStart ??
      null,

    quiet_hours_end:
      updates.quietHoursEnd ??
      null,

    badge_counter:
      updates.badgeCounter,

    notification_sound:
      updates.notificationSound,

    desktop_toasts:
      updates.desktopToasts,

    auto_mark_read:
      updates.autoMarkRead,

    retention_days:
      updates.retentionDays,
  }
}

export function getDefaultNotificationPreferences():
NotificationPreferenceUpdates {
  return {
    ...defaultPreferenceValues,
  }
}

export async function getNotificationPreferences():
Promise<NotificationPreferences> {
  const userId =
    await getAuthenticatedUserId()

  const {
    data,
    error,
  } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq(
      "user_id",
      userId,
    )
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (data) {
    return mapPreferenceRow(data)
  }

  const {
    data: createdPreference,
    error: createError,
  } = await supabase
    .from("notification_preferences")
    .insert(
      createInsertPayload(userId),
    )
    .select("*")
    .single()

  if (createError) {
    throw new Error(
      createError.message,
    )
  }

  return mapPreferenceRow(
    createdPreference,
  )
}

export async function updateNotificationPreferences(
  updates: NotificationPreferenceUpdates,
): Promise<NotificationPreferences> {
  const userId =
    await getAuthenticatedUserId()

  const {
    data,
    error,
  } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        user_id: userId,
        ...createUpdatePayload(
          updates,
        ),
      },
      {
        onConflict: "user_id",
      },
    )
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapPreferenceRow(data)
}

export async function restoreDefaultNotificationPreferences():
Promise<NotificationPreferences> {
  return updateNotificationPreferences(
    getDefaultNotificationPreferences(),
  )
}