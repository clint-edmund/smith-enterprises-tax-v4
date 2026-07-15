import { useEffect, useState } from "react"

import {
  checkDatabaseHealth,
  type DatabaseHealthResult,
} from "@/services/database-health"

type ConnectionState =
  | {
      status: "checking"
      message: string
    }
  | {
      status: "connected"
      message: string
    }
  | {
      status: "error"
      message: string
    }

export function SupabaseStatus() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>({
      status: "checking",
      message: "Checking Supabase connection...",
    })

  useEffect(() => {
    let isMounted = true

    async function loadConnectionStatus() {
      const result: DatabaseHealthResult =
        await checkDatabaseHealth()

      if (!isMounted) {
        return
      }

      setConnectionState({
        status: result.connected
          ? "connected"
          : "error",
        message: result.message,
      })
    }

    void loadConnectionStatus()

    return () => {
      isMounted = false
    }
  }, [])

  const statusClasses = {
    checking:
      "border-amber-200 bg-amber-50 text-amber-800",
    connected:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
  }

  const statusLabels = {
    checking: "Checking",
    connected: "Connected",
    error: "Connection error",
  }

  return (
    <section
      className={`rounded-xl border p-4 ${statusClasses[connectionState.status]}`}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">
            Supabase:{" "}
            {statusLabels[connectionState.status]}
          </p>

          <p className="mt-1 text-sm">
            {connectionState.message}
          </p>
        </div>

        <span
          className="mt-1 block size-3 shrink-0 rounded-full bg-current"
          aria-hidden="true"
        />
      </div>
    </section>
  )
}