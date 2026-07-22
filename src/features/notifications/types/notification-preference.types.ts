export interface NotificationPreferences {
  id: string

  userId: string

  assignmentNotifications: boolean

  clientNotifications: boolean

  returnNotifications: boolean

  paymentNotifications: boolean

  systemNotifications: boolean

  highPriorityNotifications: boolean

  securityNotifications: boolean

  browserNotifications: boolean

  emailNotifications: boolean

  dailyDigest: boolean

  weeklyDigest: boolean

  quietHoursEnabled: boolean

  quietHoursStart?: string

  quietHoursEnd?: string

  badgeCounter: boolean

  notificationSound: boolean

  desktopToasts: boolean

  autoMarkRead: boolean

  retentionDays: number

  createdAt: string

  updatedAt: string
}

export type NotificationPreferenceUpdates =
  Omit<
    NotificationPreferences,
    | "id"
    | "userId"
    | "createdAt"
    | "updatedAt"
  >