import {
  create,
} from "zustand"

import {
  clearNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification-service"

import type {
  AppNotification,
} from "../types/notification.types"

interface NotificationState {
  notifications: AppNotification[]

  unreadCount: number

  isUpdating: boolean

  setNotifications: (
    notifications:
      AppNotification[],
  ) => void

  addNotification: (
    notification:
      AppNotification,
  ) => void

  markRead: (
    id: string,
  ) => Promise<void>

  markAllRead: () =>
    Promise<void>

  clearAll: () =>
    Promise<void>
}

function calculateUnreadCount(
  notifications:
    AppNotification[],
): number {
  return notifications.filter(
    (notification) =>
      !notification.isRead,
  ).length
}

export const useNotificationStore =
  create<NotificationState>(
    (set, get) => ({
      notifications: [],

      unreadCount: 0,

      isUpdating: false,

      setNotifications: (
        notifications,
      ) => {
        set({
          notifications,

          unreadCount:
            calculateUnreadCount(
              notifications,
            ),
        })
      },

      addNotification: (
        notification,
      ) => {
        set((state) => {
          const alreadyExists =
            state.notifications.some(
              (item) =>
                item.id ===
                notification.id,
            )

          if (alreadyExists) {
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
        })
      },

      markRead: async (id) => {
        const currentNotifications =
          get().notifications

        const notification =
          currentNotifications.find(
            (item) =>
              item.id === id,
          )

        if (
          !notification ||
          notification.isRead
        ) {
          return
        }

        set({
          isUpdating: true,
        })

        try {
          await markNotificationRead(
            id,
          )

          set((state) => {
            const notifications =
              state.notifications.map(
                (item) =>
                  item.id === id
                    ? {
                        ...item,
                        isRead: true,
                      }
                    : item,
              )

            return {
              notifications,

              unreadCount:
                calculateUnreadCount(
                  notifications,
                ),
            }
          })
        } finally {
          set({
            isUpdating: false,
          })
        }
      },

      markAllRead: async () => {
        if (
          get().unreadCount === 0
        ) {
          return
        }

        set({
          isUpdating: true,
        })

        try {
          await markAllNotificationsRead()

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
          })
        } finally {
          set({
            isUpdating: false,
          })
        }
      },

      clearAll: async () => {
        if (
          get().notifications.length ===
          0
        ) {
          return
        }

        set({
          isUpdating: true,
        })

        try {
          await clearNotifications()

          set({
            notifications: [],
            unreadCount: 0,
          })
        } finally {
          set({
            isUpdating: false,
          })
        }
      },
    }),
  )