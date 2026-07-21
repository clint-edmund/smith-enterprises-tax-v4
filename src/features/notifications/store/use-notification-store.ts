import { create } from "zustand"

import type {
  AppNotification,
} from "../types/notification.types"

interface NotificationState {
  notifications: AppNotification[]

  unreadCount: number

  setNotifications: (
    notifications: AppNotification[],
  ) => void

  addNotification: (
    notification: AppNotification,
  ) => void

  markRead: (
    id: string,
  ) => void

  markAllRead: () => void

  clearAll: () => void
}

function calculateUnreadCount(
  notifications: AppNotification[],
): number {
  return notifications.filter(
    (notification) =>
      !notification.isRead,
  ).length
}

export const useNotificationStore =
  create<NotificationState>((set) => ({
    notifications: [],

    unreadCount: 0,

    setNotifications: (
      notifications,
    ) =>
      set({
        notifications,
        unreadCount:
          calculateUnreadCount(
            notifications,
          ),
      }),

    addNotification: (
      notification,
    ) =>
      set((state) => {
        const existingNotification =
          state.notifications.some(
            (item) =>
              item.id === notification.id,
          )

        if (existingNotification) {
          return state
        }

        const notifications = [
          notification,
          ...state.notifications,
        ]

        return {
          notifications,
          unreadCount:
            calculateUnreadCount(
              notifications,
            ),
        }
      }),

    markRead: (id) =>
      set((state) => {
        const notifications =
          state.notifications.map(
            (notification) =>
              notification.id === id
                ? {
                    ...notification,
                    isRead: true,
                  }
                : notification,
          )

        return {
          notifications,
          unreadCount:
            calculateUnreadCount(
              notifications,
            ),
        }
      }),

    markAllRead: () =>
      set((state) => {
        const notifications =
          state.notifications.map(
            (notification) => ({
              ...notification,
              isRead: true,
            }),
          )

        return {
          notifications,
          unreadCount: 0,
        }
      }),

    clearAll: () =>
      set({
        notifications: [],
        unreadCount: 0,
      }),
  }))