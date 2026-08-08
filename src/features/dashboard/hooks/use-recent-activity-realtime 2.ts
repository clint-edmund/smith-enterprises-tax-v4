import {
  useEffect,
  useRef,
  useState,
} from "react"

import { supabase } from "@/services/supabase"

export type ActivityRealtimeStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"

interface UseRecentActivityRealtimeOptions {
  enabled?: boolean
  onActivityInserted: () => void | Promise<void>
}

interface UseRecentActivityRealtimeResult {
  realtimeStatus: ActivityRealtimeStatus
}

export function useRecentActivityRealtime({
  enabled = true,
  onActivityInserted,
}: UseRecentActivityRealtimeOptions): UseRecentActivityRealtimeResult {
  const [
    realtimeStatus,
    setRealtimeStatus,
  ] = useState<ActivityRealtimeStatus>(
    enabled
      ? "connecting"
      : "disconnected",
  )

  const callbackRef = useRef(
    onActivityInserted,
  )

  useEffect(() => {
    callbackRef.current =
      onActivityInserted
  }, [onActivityInserted])

  useEffect(() => {
    if (!enabled) {
      setRealtimeStatus("disconnected")

      return
    }

    setRealtimeStatus("connecting")

    const channel = supabase
      .channel("dashboard-audit-log-inserts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "audit_logs",
        },
        () => {
          void callbackRef.current()
        },
      )
      .subscribe((status) => {
        switch (status) {
          case "SUBSCRIBED":
            setRealtimeStatus("connected")
            break

          case "CHANNEL_ERROR":
          case "TIMED_OUT":
            setRealtimeStatus("error")
            break

          case "CLOSED":
            setRealtimeStatus("disconnected")
            break

          default:
            setRealtimeStatus("connecting")
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [enabled])

  return {
    realtimeStatus,
  }
}