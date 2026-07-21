import {
  Bell,
  CheckCheck,
  Trash2,
  X,
} from "lucide-react"
import {
  useEffect,
  useRef,
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
  NotificationPriority,
} from "../types/notification.types"

function formatNotificationTime(
  createdAt: string,
): string {
  const createdDate =
    new Date(createdAt)

  const difference =
    Date.now() -
    createdDate.getTime()

  const minutes =
    Math.floor(
      difference / 60_000,
    )

  if (minutes < 1) {
    return "Just now"
  }

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours =
    Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours}h ago`
  }

  const days =
    Math.floor(hours / 24)

  if (days < 7) {
    return `${days}d ago`
  }

  return createdDate.toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
    },
  )
}

function getPriorityClasses(
  priority: NotificationPriority,
): string {
  const classes: Record<
    NotificationPriority,
    string
  > = {
    low:
      "border-slate-200 bg-slate-50 text-slate-700",

    normal:
      "border-blue-200 bg-blue-50 text-blue-700",

    high:
      "border-amber-200 bg-amber-50 text-amber-800",

    critical:
      "border-red-200 bg-red-50 text-red-700",
  }

  return classes[priority]
}

interface NotificationItemProps {
  notification: AppNotification
  onRead: (
    notificationId: string,
  ) => Promise<void>
  onClose: () => void
}

function NotificationItem({
  notification,
  onRead,
  onClose,
}: NotificationItemProps) {
  const content = (
    <div
      className={`rounded-xl border p-4 transition ${
        notification.isRead
          ? "border-slate-200 bg-white"
          : "border-blue-200 bg-blue-50/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-950">
              {notification.title}
            </p>

            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getPriorityClasses(
                notification.priority,
              )}`}
            >
              {notification.priority}
            </span>
          </div>

          <p className="mt-1 text-sm leading-5 text-slate-600">
            {notification.message}
          </p>

          <p className="mt-2 text-xs font-medium text-slate-500">
            {formatNotificationTime(
              notification.createdAt,
            )}
          </p>
        </div>

        {!notification.isRead && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()

              void onRead(
                notification.id,
              )
            }}
            className="rounded-lg p-1.5 text-blue-700 transition hover:bg-blue-100"
            aria-label={`Mark ${notification.title} as read`}
            title="Mark as read"
          >
            <CheckCheck className="size-4" />
          </button>
        )}
      </div>
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link
        to={notification.actionUrl}
        onClick={() => {
          void onRead(
            notification.id,
          )

          onClose()
        }}
        className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      >
        {content}
      </Link>
    )
  }

  return content
}

export function NotificationBell() {
  const [isOpen, setIsOpen] =
    useState(false)

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
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

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (
      event: MouseEvent,
    ) => {
      const target =
        event.target

      if (
        target instanceof Node &&
        !containerRef.current?.contains(
          target,
        )
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown,
    )

    document.addEventListener(
      "keydown",
      handleKeyDown,
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown,
      )

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      )
    }
  }, [isOpen])

  const visibleNotifications =
    notifications.slice(0, 20)

  return (
    <div
      ref={containerRef}
      className="relative"
    >
    
      <button
        type="button"
        onClick={() => {
          setIsOpen(
            (currentValue) =>
              !currentValue,
          )
        }}
        className="relative inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell className="size-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div>
              <h2 className="font-bold text-slate-950">
                Notifications
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You are all caught up"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
              }}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              aria-label="Close notifications"
            >
              <X className="size-4" />
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  void markAllRead()
                }}
                disabled={
                  unreadCount === 0
                }
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <CheckCheck className="size-4" />
                Mark all read
              </button>

              <button
                type="button"
                onClick={() => {
                  void clearAll()
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-red-700 transition hover:text-red-900"
              >
                <Trash2 className="size-4" />
                Clear all
              </button>
            </div>
          )}

          <div className="max-h-[32rem] overflow-y-auto p-3">
            {visibleNotifications.length ===
            0 ? (
              <div className="px-4 py-12 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Bell className="size-6" />
                </div>

                <p className="mt-4 font-semibold text-slate-950">
                  No notifications
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  New assignments and alerts
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleNotifications.map(
                  (notification) => (
                    <NotificationItem
                      key={
                        notification.id
                      }
                      notification={
                        notification
                      }
                      onRead={markRead}
                      onClose={() => {
                        setIsOpen(false)
                      }}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}