import {
  ArrowLeft,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import {
  appConfig,
} from "@/config/app-config"

import {
  NotificationPreferencesPanel,
} from "../components/notification-preferences-panel"

export function NotificationPreferencesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
          to={
            appConfig.routes.settings
          }
        >
          <ArrowLeft className="size-4" />

          Back to settings
        </Link>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-blue-700">
          Account settings
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Notification preferences
        </h1>

        <p className="mt-2 max-w-3xl text-slate-600">
          Manage the alerts you
          receive, how they are
          delivered, and how
          notifications behave inside
          the application.
        </p>
      </div>

      <NotificationPreferencesPanel />
    </div>
  )
}