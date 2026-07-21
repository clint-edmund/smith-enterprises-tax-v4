import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ExternalLink,
  Search,
  Trash2,
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
    case "high":
      return [
        "border-red-200",
        "bg-red-50",
        "text-red-700",
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

function getCategoryLabel(
  category:
    AppNotification["category"],
): string {
  return category
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    )
}

interface NotificationCardProps {
  notification:
    AppNotification

  onMarkRead: (
    notificationId: string,
  ) => Promise<void>
}

function NotificationCard({
  notification,
  onMarkRead,
}: NotificationCardProps) {
  const cardClasses = [
    "rounded-xl border p-5",
    "transition-shadow",
    "hover:shadow-sm",
    notification.isRead
      ? "border-slate-200 bg-white"
      : "border-blue-200 bg-blue-50/40",
  ].join(" ")

  return (
    <article className={cardClasses}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {!notification.isRead && (
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
              {notification.priority}
            </span>

            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              {getCategoryLabel(
                notification.category,
              )}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {notification.message}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span>
              {formatNotificationDate(
                notification.createdAt,
              )}
            </span>

            {notification.relatedEntityType && (
              <span>
                Related record:{" "}
                {formatLabel(
              notification.relatedEntityType,
            )}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!notification.isRead && (
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
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
              onClick={() => {
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

  const clearAll =
    useNotificationStore(
      (state) =>
        state.clearAll,
    )

  const readCount =
    notifications.length -
    unreadCount

  const filteredNotifications =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase()

      return notifications.filter(
        (notification) => {
          const matchesFilter =
            activeFilter === "all" ||
            (
              activeFilter ===
                "unread" &&
              !notification.isRead
            ) ||
            (
              activeFilter ===
                "read" &&
              notification.isRead
            )

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
            notification.relatedEntityType ??
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

        <div className="flex flex-wrap items-center gap-2">
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

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              notifications.length ===
                0 ||
              isUpdating
            }
            onClick={() => {
              const shouldClear =
                window.confirm(
                  "Clear all notifications? This action cannot be undone.",
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
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              Total
            </p>

            <Bell className="h-5 w-5 text-slate-400" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {notifications.length}
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
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              aria-label="Search notifications"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              onChange={(event) => {
                setSearchQuery(
                  event.target.value,
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
                setActiveFilter(
                  "all",
                )
              }}
              type="button"
            >
              All ({notifications.length})
            </button>

            <button
              className={filterButtonClasses(
                "unread",
              )}
              onClick={() => {
                setActiveFilter(
                  "unread",
                )
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
                setActiveFilter(
                  "read",
                )
              }}
              type="button"
            >
              Read ({readCount})
            </button>
          </div>
        </div>
      </div>

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
              />
            ),
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BellOff className="mx-auto h-10 w-10 text-slate-400" />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No notifications found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {notifications.length === 0
              ? "You do not currently have any notifications."
              : "No notifications match the selected filter or search term."}
          </p>

          {searchQuery && (
            <button
              className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setSearchQuery("")
                setActiveFilter(
                  "all",
                )
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