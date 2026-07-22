import { PlaceholderPage } from "@/components/common/placeholder-page"
import {
  Bell,
  ChevronRight,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

import {
  appConfig,
} from "@/config/app-config"


export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Manage application preferences, staff access, preparers, roles, and administrative controls."
    />
  )
}

<Link
  className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
  to={
    appConfig.routes
      .notificationPreferences
  }
>
  <div className="flex min-w-0 items-start gap-4">
    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
      <Bell className="size-5" />
    </div>

    <div className="min-w-0">
      <h2 className="font-bold text-slate-950">
        Notification preferences
      </h2>

      <p className="mt-1 text-sm leading-6 text-slate-600">
        Manage notification categories,
        delivery methods, badge behavior,
        sounds, and desktop alerts.
      </p>
    </div>
  </div>

  <ChevronRight className="size-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
</Link>