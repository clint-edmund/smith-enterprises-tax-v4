export type NotificationPriority =
  | "low"
  | "normal"
  | "high"
  | "critical"

export type NotificationCategory =
  | "assignment"
  | "deadline"
  | "payment"
  | "client"
  | "document"
  | "system"

export interface AppNotification {
  id: string

  title: string

  message: string

  category: NotificationCategory

  priority: NotificationPriority

  isRead: boolean

  createdAt: string

  actionUrl?: string

  relatedEntityId?: string

  relatedEntityType?: string
}