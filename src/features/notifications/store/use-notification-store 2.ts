import {
  create,
} from "zustand"

import {
  archiveNotifications,
  clearNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  permanentlyDeleteNotifications,
  restoreDeletedNotifications,
  restoreNotifications,
  softDeleteNotifications,
} from "../services/notification-service"

import type {
  AppNotification,
} from "../types/notification.types"

interface NotificationState {
  notifications: AppNotification[]

  unreadCount: number

  isUpdating: boolean

  setNotifications: (
    notifications: AppNotification[],
  ) => void

  addNotification: (
    notification: AppNotification,
  ) => void

  markRead: (
    id: string,
  ) => Promise<void>

  markAllRead: () => Promise<void>

  archiveSelected: (
    ids: string[],
  ) => Promise<void>

  restoreSelected: (
    ids: string[],
  ) => Promise<void>

  deleteSelected: (
    ids: string[],
  ) => Promise<void>

  restoreDeletedSelected: (
    ids: string[],
  ) => Promise<void>

  

    permanentlyDeleteSelected: (
    ids: string[],
  ) => Promise<void>

  clearAll: () => Promise<void>
}

function calculateUnreadCount(
  notifications: AppNotification[],
): number {
  return notifications.filter(
    (notification) =>
      !notification.isRead &&
      !notification.isArchived &&
      !notification.deletedAt,
  ).length
}

function normalizeNotificationIds(
  ids: string[],
): string[] {
  return Array.from(
    new Set(
      ids
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  )
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

      markRead: async (
        id,
      ) => {
        const normalizedId =
          id.trim()

        if (!normalizedId) {
          return
        }

        const currentState =
          get()

        if (
          currentState.isUpdating
        ) {
          return
        }

        const notification =
          currentState.notifications.find(
            (item) =>
              item.id ===
              normalizedId,
          )

        if (
          !notification ||
          notification.isRead ||
          notification.isArchived ||
          notification.deletedAt
        ) {
          return
        }

        set({
          isUpdating: true,
        })

        try {
          await markNotificationRead(
            normalizedId,
          )

          set((state) => {
            const notifications =
              state.notifications.map(
                (item) =>
                  item.id ===
                  normalizedId
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
        const currentState =
          get()

        if (
          currentState.isUpdating ||
          currentState.unreadCount ===
            0
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
                (notification) => {
                  if (
                    notification.isArchived ||
                    notification.deletedAt
                  ) {
                    return notification
                  }

                  return {
                    ...notification,

                    isRead: true,
                  }
                },
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

      archiveSelected: async (
        ids,
      ) => {
        const normalizedIds =
          normalizeNotificationIds(
            ids,
          )

        const currentState =
          get()

        if (
          normalizedIds.length ===
            0 ||
          currentState.isUpdating
        ) {
          return
        }

        const activeIds =
          normalizedIds.filter(
            (notificationId) => {
              const notification =
                currentState.notifications.find(
                  (item) =>
                    item.id ===
                    notificationId,
                )

              return Boolean(
                notification &&
                !notification.isArchived &&
                !notification.deletedAt,
              )
            },
          )

        if (
          activeIds.length === 0
        ) {
          return
        }

        set({
          isUpdating: true,
        })

        try {
          await archiveNotifications(
            activeIds,
          )

          const archivedAt =
            new Date().toISOString()

          const archivedIdSet =
            new Set(activeIds)

          set((state) => {
            const notifications =
              state.notifications.map(
                (notification) =>
                  archivedIdSet.has(
                    notification.id,
                  )
                    ? {
                        ...notification,

                        isArchived: true,

                        archivedAt,
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
          })
        } finally {
          set({
            isUpdating: false,
          })
        }
      },

      restoreSelected: async (
        ids,
      ) => {
        const normalizedIds =
          normalizeNotificationIds(
            ids,
          )

        const currentState =
          get()

        if (
          normalizedIds.length ===
            0 ||
          currentState.isUpdating
        ) {
          return
        }

        const archivedIds =
          normalizedIds.filter(
            (notificationId) => {
              const notification =
                currentState.notifications.find(
                  (item) =>
                    item.id ===
                    notificationId,
                )

              return Boolean(
                notification &&
                notification.isArchived &&
                !notification.deletedAt,
              )
            },
          )

        if (
          archivedIds.length === 0
        ) {
          return
        }

        set({
          isUpdating: true,
        })

        try {
          await restoreNotifications(
            archivedIds,
          )

          const restoredIdSet =
            new Set(archivedIds)

          set((state) => {
            const notifications =
              state.notifications.map(
                (notification) =>
                  restoredIdSet.has(
                    notification.id,
                  )
                    ? {
                        ...notification,

                        isArchived: false,

                        archivedAt:
                          undefined,
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
          })
        } finally {
          set({
            isUpdating: false,
          })
        }
      },

      deleteSelected: async (
        ids,
      ) => {
        const normalizedIds =
          normalizeNotificationIds(
            ids,
          )

        const currentState =
          get()

        if (
          normalizedIds.length ===
            0 ||
          currentState.isUpdating
        ) {
          return
        }

        const deletableIds =
          normalizedIds.filter(
            (notificationId) => {
              const notification =
                currentState.notifications.find(
                  (item) =>
                    item.id ===
                    notificationId,
                )

              return Boolean(
                notification &&
                !notification.deletedAt,
              )
            },
          )

        if (
          deletableIds.length ===
            0
        ) {
          return
        }

        set({
          isUpdating: true,
        })

        try {
          await softDeleteNotifications(
            deletableIds,
          )

          const deletedAt =
            new Date().toISOString()

          const deletedIdSet =
            new Set(deletableIds)

          set((state) => {
            const notifications =
              state.notifications.map(
                (notification) =>
                  deletedIdSet.has(
                    notification.id,
                  )
                    ? {
                        ...notification,

                        deletedAt,
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
          })
        } finally {
          set({
            isUpdating: false,
          })
        }
      },

      restoreDeletedSelected:
        async (
          ids,
        ) => {
          const normalizedIds =
            normalizeNotificationIds(
              ids,
            )

          const currentState =
            get()

          if (
            normalizedIds.length ===
              0 ||
            currentState.isUpdating
          ) {
            return
          }

          const deletedIds =
            normalizedIds.filter(
              (notificationId) => {
                const notification =
                  currentState
                    .notifications
                    .find(
                      (item) =>
                        item.id ===
                        notificationId,
                    )

                return Boolean(
                  notification
                    ?.deletedAt,
                )
              },
            )

          if (
            deletedIds.length ===
              0
          ) {
            return
          }

          set({
            isUpdating: true,
          })

          try {
            await restoreDeletedNotifications(
              deletedIds,
            )

            const restoredIdSet =
              new Set(deletedIds)

            set((state) => {
              const notifications =
                state.notifications.map(
                  (notification) =>
                    restoredIdSet.has(
                      notification.id,
                    )
                      ? {
                          ...notification,

                          deletedAt:
                            undefined,
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
            })
          } finally {
            set({
              isUpdating: false,
            })
          }
        },
            permanentlyDeleteSelected:
        async (
          ids,
        ) => {
          const normalizedIds =
            normalizeNotificationIds(
              ids,
            )

          const currentState =
            get()

          if (
            normalizedIds.length ===
              0 ||
            currentState.isUpdating
          ) {
            return
          }

          const permanentlyDeletableIds =
            normalizedIds.filter(
              (notificationId) => {
                const notification =
                  currentState
                    .notifications
                    .find(
                      (item) =>
                        item.id ===
                        notificationId,
                    )

                return Boolean(
                  notification
                    ?.deletedAt,
                )
              },
            )

          if (
            permanentlyDeletableIds
              .length === 0
          ) {
            return
          }

          set({
            isUpdating: true,
          })

          try {
            await permanentlyDeleteNotifications(
              permanentlyDeletableIds,
            )

            const deletedIdSet =
              new Set(
                permanentlyDeletableIds,
              )

            set((state) => {
              const notifications =
                state.notifications.filter(
                  (notification) =>
                    !deletedIdSet.has(
                      notification.id,
                    ),
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
      clearAll: async () => {
        const currentState =
          get()

        const hasActiveNotifications =
          currentState.notifications.some(
            (notification) =>
              !notification.deletedAt,
          )

        if (
          !hasActiveNotifications ||
          currentState.isUpdating
        ) {
          return
        }

        set({
          isUpdating: true,
        })

        try {
          await clearNotifications()

          const deletedAt =
            new Date().toISOString()

          set((state) => {
            const notifications =
              state.notifications.map(
                (notification) =>
                  notification.deletedAt
                    ? notification
                    : {
                        ...notification,

                        deletedAt,
                      },
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
    }),
  )