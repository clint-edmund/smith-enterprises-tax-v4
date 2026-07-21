import {
  useCallback,
  useEffect,
  useRef,
} from "react"

import {
  supabase,
} from "@/services/supabase"

import {
  getNotifications,
} from "../services/notification-service"
import {
  useNotificationStore,
} from "../store/use-notification-store"

export function NotificationSync() {
  const refreshTimerRef =
    useRef<
      ReturnType<typeof setTimeout> |
      null
    >(null)

  const setNotifications =
    useNotificationStore(
      (state) =>
        state.setNotifications,
    )

  const loadNotifications =
    useCallback(async () => {
      try {
        const notifications =
          await getNotifications()

        setNotifications(
          notifications,
        )
      } catch (error) {
        console.error(
          "Unable to load notifications:",
          error,
        )
      }
    }, [setNotifications])

  useEffect(() => {
    let isMounted = true

    const startSubscription =
      async () => {
        const {
          data,
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error(
            "Unable to identify notification recipient:",
            error,
          )

          return
        }

        if (
          !data.user ||
          !isMounted
        ) {
          return
        }

        await loadNotifications()

        if (!isMounted) {
          return
        }

        const scheduleRefresh = () => {
          if (
            refreshTimerRef.current
          ) {
            clearTimeout(
              refreshTimerRef.current,
            )
          }

          refreshTimerRef.current =
            setTimeout(() => {
              refreshTimerRef.current =
                null

              void loadNotifications()
            }, 200)
        }

        const channel =
          supabase
            .channel(
              `notifications-${data.user.id}`,
            )
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table:
                  "notifications",
                filter:
                  `recipient_user_id=eq.${data.user.id}`,
              },
              scheduleRefresh,
            )
            .subscribe(
              (
                status,
                subscriptionError,
              ) => {
                if (
                  status ===
                    "CHANNEL_ERROR" ||
                  status ===
                    "TIMED_OUT"
                ) {
                  console.error(
                    "Notification subscription failed:",
                    status,
                    subscriptionError,
                  )
                }
              },
            )

        return channel
      }

    let notificationChannel:
      ReturnType<
        typeof supabase.channel
      > |
      undefined

    void startSubscription().then(
      (channel) => {
        notificationChannel =
          channel
      },
    )

    return () => {
      isMounted = false

      if (
        refreshTimerRef.current
      ) {
        clearTimeout(
          refreshTimerRef.current,
        )

        refreshTimerRef.current =
          null
      }

      if (notificationChannel) {
        void supabase.removeChannel(
          notificationChannel,
        )
      }
    }
  }, [loadNotifications])

  return null
}