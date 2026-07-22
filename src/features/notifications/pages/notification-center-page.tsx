import {
  Archive,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ExternalLink,
  ListChecks,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react"
import {
  useMemo,
  useState,
} from "react"
import {
  Link,
} from "react-router-dom"

import {
  useNotificationStore,
} from "../store/use-notification-store"

import type {
  AppNotification,
} from "../types/notification.types"

type NotificationFilter =
  | "all"
  | "unread"
  | "read"
  | "archived"
  | "deleted"

interface NotificationCardProps {
  notification: AppNotification

  onMarkRead: (
    notificationId: string,
  ) => Promise<void>

  onToggleSelection: (
    notificationId: string,
  ) => void

  selected: boolean

  selectionMode: boolean
}

function formatNotificationDate(
  value: string,
): string {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unknown date"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date)
}

function getPriorityClasses(
  priority:
    AppNotification["priority"],
): string {
  switch (priority) {
    case "critical":
      return [
        "border-red-300",
        "bg-red-100",
        "text-red-800",
      ].join(" ")

    case "high":
      return [
        "border-orange-200",
        "bg-orange-50",
        "text-orange-700",
      ].join(" ")

    case "normal":
      return [
        "border-amber-200",
        "bg-amber-50",
        "text-amber-700",
      ].join(" ")

    case "low":
      return [
        "border-slate-200",
        "bg-slate-50",
        "text-slate-600",
      ].join(" ")

    default:
      return [
        "border-blue-200",
        "bg-blue-50",
        "text-blue-700",
      ].join(" ")
  }
}

function formatLabel(
  value: string,
): string {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    )
}

function NotificationCard({
  notification,
  onMarkRead,
  onToggleSelection,
  selected,
  selectionMode,
}: NotificationCardProps) {
  const isDeleted =
    Boolean(notification.deletedAt)

  const cardClasses = [
    "rounded-xl border p-5",
    "transition-all",
    "hover:shadow-sm",
    selected
      ? [
          "border-blue-500",
          "bg-blue-50",
          "ring-2",
          "ring-blue-100",
        ].join(" ")
      : isDeleted
        ? [
            "border-red-200",
            "bg-red-50/50",
          ].join(" ")
        : notification.isArchived
          ? [
              "border-violet-200",
              "bg-violet-50/40",
            ].join(" ")
          : notification.isRead
            ? "border-slate-200 bg-white"
            : "border-blue-200 bg-blue-50/40",
    selectionMode
      ? "cursor-pointer"
      : "",
  ].join(" ")

  const handleCardSelection = () => {
    if (!selectionMode) {
      return
    }

    onToggleSelection(
      notification.id,
    )
  }

  return (
    <article
      aria-selected={
        selectionMode
          ? selected
          : undefined
      }
      className={cardClasses}
      onClick={handleCardSelection}
    >
      <div className="flex items-start gap-4">
        {selectionMode && (
          <div className="pt-1">
            <input
              aria-label={
                selected
                  ? `Deselect ${notification.title}`
                  : `Select ${notification.title}`
              }
              checked={selected}
              className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              onChange={() => {
                onToggleSelection(
                  notification.id,
                )
              }}
              onClick={(event) => {
                event.stopPropagation()
              }}
              type="checkbox"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {!notification.isRead &&
                  !notification.isArchived &&
                  !isDeleted && (
                    <span
                      aria-label="Unread notification"
                      className="h-2.5 w-2.5 rounded-full bg-blue-600"
                    />
                  )}

                <h2 className="text-base font-semibold text-slate-900">
                  {notification.title}
                </h2>

                <span
                  className={[
                    "rounded-full border px-2.5 py-1",
                    "text-xs font-medium",
                    getPriorityClasses(
                      notification.priority,
                    ),
                  ].join(" ")}
                >
                  {formatLabel(
                    notification.priority,
                  )}
                </span>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {formatLabel(
                    notification.category,
                  )}
                </span>

                {notification.isArchived &&
                  !isDeleted && (
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                      Archived
                    </span>
                  )}

                {isDeleted && (
                  <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                    Deleted
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {notification.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span>
                  Created:{" "}
                  {formatNotificationDate(
                    notification.createdAt,
                  )}
                </span>

                {notification.archivedAt && (
                  <span>
                    Archived:{" "}
                    {formatNotificationDate(
                      notification.archivedAt,
                    )}
                  </span>
                )}

                {notification.deletedAt && (
                  <span className="font-medium text-red-600">
                    Deleted:{" "}
                    {formatNotificationDate(
                      notification.deletedAt,
                    )}
                  </span>
                )}

                {notification.relatedEntityType && (
                  <span>
                    Related record:{" "}
                    {formatLabel(
                      notification
                        .relatedEntityType,
                    )}
                  </span>
                )}
              </div>
            </div>

            {!selectionMode &&
              !notification.isArchived &&
              !isDeleted && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {!notification.isRead && (
                    <button
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      onClick={(event) => {
                        event.stopPropagation()

                        void onMarkRead(
                          notification.id,
                        )
                      }}
                      type="button"
                    >
                      <Check className="h-4 w-4" />

                      Mark read
                    </button>
                  )}

                  {notification.actionUrl && (
                    <Link
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
                      onClick={(event) => {
                        event.stopPropagation()

                        if (
                          !notification.isRead
                        ) {
                          void onMarkRead(
                            notification.id,
                          )
                        }
                      }}
                      to={
                        notification.actionUrl
                      }
                    >
                      Open

                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function NotificationCenterPage() {
  const [searchQuery, setSearchQuery] =
    useState("")

  const [activeFilter, setActiveFilter] =
    useState<NotificationFilter>(
      "all",
    )

  const [selectionMode, setSelectionMode] =
    useState(false)

  const [
    selectedNotificationIds,
    setSelectedNotificationIds,
  ] = useState<string[]>([])

  const notifications =
    useNotificationStore(
      (state) =>
        state.notifications,
    )

  const unreadCount =
    useNotificationStore(
      (state) =>
        state.unreadCount,
    )

  const isUpdating =
    useNotificationStore(
      (state) =>
        state.isUpdating,
    )

  const markRead =
    useNotificationStore(
      (state) =>
        state.markRead,
    )

  const markAllRead =
    useNotificationStore(
      (state) =>
        state.markAllRead,
    )

  const archiveSelected =
    useNotificationStore(
      (state) =>
        state.archiveSelected,
    )

  const restoreSelected =
    useNotificationStore(
      (state) =>
        state.restoreSelected,
    )

  const deleteSelected =
    useNotificationStore(
      (state) =>
        state.deleteSelected,
    )

  const restoreDeletedSelected =
    useNotificationStore(
      (state) =>
        state.restoreDeletedSelected,
    )

  const clearAll =
    useNotificationStore(
      (state) =>
        state.clearAll,
    )

  const activeNotifications =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.isArchived &&
            !notification.deletedAt,
        ),
      [notifications],
    )

  const archivedNotifications =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            notification.isArchived &&
            !notification.deletedAt,
        ),
      [notifications],
    )

  const deletedNotifications =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            Boolean(
              notification.deletedAt,
            ),
        ),
      [notifications],
    )

  const readCount =
    activeNotifications.filter(
      (notification) =>
        notification.isRead,
    ).length

  const archivedCount =
    archivedNotifications.length

  const deletedCount =
    deletedNotifications.length

  const filteredNotifications =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase()

      return notifications.filter(
        (notification) => {
          const isDeleted =
            Boolean(
              notification.deletedAt,
            )

          let matchesFilter =
            false

          switch (activeFilter) {
            case "all":
              matchesFilter =
                !notification.isArchived &&
                !isDeleted
              break

            case "unread":
              matchesFilter =
                !notification.isArchived &&
                !isDeleted &&
                !notification.isRead
              break

            case "read":
              matchesFilter =
                !notification.isArchived &&
                !isDeleted &&
                notification.isRead
              break

            case "archived":
              matchesFilter =
                notification.isArchived &&
                !isDeleted
              break

            case "deleted":
              matchesFilter =
                isDeleted
              break
          }

          if (!matchesFilter) {
            return false
          }

          if (!normalizedSearch) {
            return true
          }

          const searchableValue = [
            notification.title,
            notification.message,
            notification.category,
            notification.priority,
            notification
              .relatedEntityType ??
              "",
          ]
            .join(" ")
            .toLowerCase()

          return searchableValue.includes(
            normalizedSearch,
          )
        },
      )
    }, [
      activeFilter,
      notifications,
      searchQuery,
    ])

  const visibleNotificationIds =
    useMemo(
      () =>
        filteredNotifications.map(
          (notification) =>
            notification.id,
        ),
      [filteredNotifications],
    )

  const selectedCount =
    selectedNotificationIds.length

  const allVisibleSelected =
    visibleNotificationIds.length > 0 &&
    visibleNotificationIds.every(
      (notificationId) =>
        selectedNotificationIds.includes(
          notificationId,
        ),
    )

  const isArchivedView =
    activeFilter === "archived"

  const isDeletedView =
    activeFilter === "deleted"

  const toggleSelection = (
    notificationId: string,
  ) => {
    setSelectedNotificationIds(
      (currentIds) => {
        if (
          currentIds.includes(
            notificationId,
          )
        ) {
          return currentIds.filter(
            (currentId) =>
              currentId !==
              notificationId,
          )
        }

        return [
          ...currentIds,
          notificationId,
        ]
      },
    )
  }

  const selectAllVisible = () => {
    setSelectedNotificationIds(
      (currentIds) => {
        const nextIds =
          new Set(currentIds)

        visibleNotificationIds.forEach(
          (notificationId) => {
            nextIds.add(
              notificationId,
            )
          },
        )

        return Array.from(nextIds)
      },
    )
  }

  const deselectAllVisible = () => {
    setSelectedNotificationIds(
      (currentIds) =>
        currentIds.filter(
          (notificationId) =>
            !visibleNotificationIds.includes(
              notificationId,
            ),
        ),
    )
  }

  const clearSelection = () => {
    setSelectedNotificationIds([])
    setSelectionMode(false)
  }

  const startSelectionMode = () => {
    setSelectedNotificationIds([])
    setSelectionMode(true)
  }

  const changeFilter = (
    filter:
      NotificationFilter,
  ) => {
    setActiveFilter(filter)
    setSelectedNotificationIds([])
    setSelectionMode(false)
  }

  const handleArchiveOrRestore =
    async () => {
      if (
        selectedCount === 0 ||
        isUpdating ||
        isDeletedView
      ) {
        return
      }

      if (isArchivedView) {
        await restoreSelected(
          selectedNotificationIds,
        )
      } else {
        await archiveSelected(
          selectedNotificationIds,
        )
      }

      clearSelection()
    }

  const handleDelete =
    async () => {
      if (
        selectedCount === 0 ||
        isUpdating ||
        isDeletedView
      ) {
        return
      }

      const shouldDelete =
        window.confirm(
          `Move ${selectedCount} selected notification${
            selectedCount === 1
              ? ""
              : "s"
          } to Deleted?`,
        )

      if (!shouldDelete) {
        return
      }

      await deleteSelected(
        selectedNotificationIds,
      )

      clearSelection()
    }

  const handleRestoreDeleted =
    async () => {
      if (
        selectedCount === 0 ||
        isUpdating ||
        !isDeletedView
      ) {
        return
      }

      await restoreDeletedSelected(
        selectedNotificationIds,
      )

      clearSelection()
    }

  const filterButtonClasses = (
    filter:
      NotificationFilter,
  ): string => {
    const isActive =
      activeFilter === filter

    return [
      "rounded-lg px-4 py-2",
      "text-sm font-medium",
      "transition-colors",
      isActive
        ? "bg-blue-700 text-white"
        : [
            "border",
            "border-slate-300",
            "bg-white",
            "text-slate-700",
            "hover:bg-slate-50",
          ].join(" "),
    ].join(" ")
  }

  const visibleCount =
    filteredNotifications.length

  return (
    <section className="space-y-6 p-6 lg:p-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Communication Center
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review assignments, system
            alerts, and other activity
            requiring your attention.
          </p>
        </div>

        {!selectionMode ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                visibleCount === 0 ||
                isUpdating
              }
              onClick={
                startSelectionMode
              }
              type="button"
            >
              <ListChecks className="h-4 w-4" />

              Select
            </button>

            {!isArchivedView &&
              !isDeletedView && (
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    unreadCount === 0 ||
                    isUpdating
                  }
                  onClick={() => {
                    void markAllRead()
                  }}
                  type="button"
                >
                  <CheckCheck className="h-4 w-4" />

                  Mark all read
                </button>
              )}

            {!isDeletedView && (
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  activeNotifications.length ===
                    0 &&
                  archivedNotifications.length ===
                    0 ||
                  isUpdating
                }
                onClick={() => {
                  const shouldClear =
                    window.confirm(
                      "Move all active and archived notifications to Deleted?",
                    )

                  if (shouldClear) {
                    void clearAll()
                  }
                }}
                type="button"
              >
                <Trash2 className="h-4 w-4" />

                Clear all
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span
              aria-live="polite"
              className="inline-flex min-h-10 items-center rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-800"
            >
              {selectedCount} selected
            </span>

            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                visibleNotificationIds
                  .length === 0 ||
                isUpdating
              }
              onClick={() => {
                if (allVisibleSelected) {
                  deselectAllVisible()
                } else {
                  selectAllVisible()
                }
              }}
              type="button"
            >
              <CheckCheck className="h-4 w-4" />

              {allVisibleSelected
                ? "Deselect visible"
                : "Select visible"}
            </button>

            {isDeletedView ? (
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  selectedCount === 0 ||
                  isUpdating
                }
                onClick={() => {
                  void handleRestoreDeleted()
                }}
                type="button"
              >
                <RotateCcw className="h-4 w-4" />

                Restore deleted
              </button>
            ) : (
              <>
                <button
                  className={[
                    "inline-flex items-center gap-2",
                    "rounded-lg border bg-white",
                    "px-4 py-2 text-sm font-medium",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-50",
                    isArchivedView
                      ? [
                          "border-emerald-200",
                          "text-emerald-700",
                          "hover:bg-emerald-50",
                        ].join(" ")
                      : [
                          "border-violet-200",
                          "text-violet-700",
                          "hover:bg-violet-50",
                        ].join(" "),
                  ].join(" ")}
                  disabled={
                    selectedCount === 0 ||
                    isUpdating
                  }
                  onClick={() => {
                    void handleArchiveOrRestore()
                  }}
                  type="button"
                >
                  {isArchivedView ? (
                    <>
                      <RotateCcw className="h-4 w-4" />

                      Restore archive
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />

                      Archive
                    </>
                  )}
                </button>

                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    selectedCount === 0 ||
                    isUpdating
                  }
                  onClick={() => {
                    void handleDelete()
                  }}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />

                  Delete
                </button>
              </>
            )}

            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isUpdating}
              onClick={clearSelection}
              type="button"
            >
              <X className="h-4 w-4" />

              Cancel
            </button>
          </div>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              Active
            </p>

            <Bell className="h-5 w-5 text-slate-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {activeNotifications.length}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-700">
              Unread
            </p>

            <Bell className="h-5 w-5 text-blue-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-blue-900">
            {unreadCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              Read
            </p>

            <CheckCheck className="h-5 w-5 text-slate-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {readCount}
          </p>
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-violet-700">
              Archived
            </p>

            <Archive className="h-5 w-5 text-violet-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-violet-900">
            {archivedCount}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-red-700">
              Deleted
            </p>

            <Trash2 className="h-5 w-5 text-red-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-red-900">
            {deletedCount}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              aria-label="Search notifications"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              onChange={(event) => {
                setSearchQuery(
                  event.target.value,
                )

                setSelectedNotificationIds(
                  [],
                )
              }}
              placeholder="Search notifications..."
              type="search"
              value={searchQuery}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className={filterButtonClasses(
                "all",
              )}
              onClick={() => {
                changeFilter("all")
              }}
              type="button"
            >
              All ({activeNotifications.length})
            </button>

            <button
              className={filterButtonClasses(
                "unread",
              )}
              onClick={() => {
                changeFilter("unread")
              }}
              type="button"
            >
              Unread ({unreadCount})
            </button>

            <button
              className={filterButtonClasses(
                "read",
              )}
              onClick={() => {
                changeFilter("read")
              }}
              type="button"
            >
              Read ({readCount})
            </button>

            <button
              className={filterButtonClasses(
                "archived",
              )}
              onClick={() => {
                changeFilter(
                  "archived",
                )
              }}
              type="button"
            >
              Archived ({archivedCount})
            </button>

            <button
              className={filterButtonClasses(
                "deleted",
              )}
              onClick={() => {
                changeFilter(
                  "deleted",
                )
              }}
              type="button"
            >
              Deleted ({deletedCount})
            </button>
          </div>
        </div>
      </div>

      {selectionMode && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {isDeletedView
            ? "Select deleted notifications to restore them."
            : isArchivedView
              ? "Select archived notifications to restore or delete them."
              : "Select active notifications to archive or delete them."}
        </div>
      )}

      {filteredNotifications.length >
      0 ? (
        <div className="space-y-3">
          {filteredNotifications.map(
            (notification) => (
              <NotificationCard
                key={notification.id}
                notification={
                  notification
                }
                onMarkRead={
                  markRead
                }
                onToggleSelection={
                  toggleSelection
                }
                selected={
                  selectedNotificationIds
                    .includes(
                      notification.id,
                    )
                }
                selectionMode={
                  selectionMode
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          {isDeletedView ? (
            <Trash2 className="mx-auto h-10 w-10 text-slate-400" />
          ) : isArchivedView ? (
            <Archive className="mx-auto h-10 w-10 text-slate-400" />
          ) : (
            <BellOff className="mx-auto h-10 w-10 text-slate-400" />
          )}

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {isDeletedView
              ? "No deleted notifications"
              : isArchivedView
                ? "No archived notifications"
                : "No notifications found"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {isDeletedView
              ? "Notifications moved to Deleted will appear here and can be restored."
              : isArchivedView
                ? "Notifications you archive will appear here and can be restored."
                : activeNotifications.length ===
                    0
                  ? "You do not currently have any active notifications."
                  : "No notifications match the selected filter or search term."}
          </p>

          {searchQuery && (
            <button
              className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setSearchQuery("")
                changeFilter("all")
              }}
              type="button"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </section>
  )
}