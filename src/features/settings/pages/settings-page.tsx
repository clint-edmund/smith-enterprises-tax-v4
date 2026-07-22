import {
  Bell,
  ChevronRight,
  Settings,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import {
  appConfig,
} from "@/config/app-config"

export function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Administration
        </p>

        <div className="mt-2 flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Settings className="size-6" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Settings
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Manage application preferences, staff access,
              preparers, roles, notifications, and administrative
              controls.
            </p>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="application-settings-heading"
        className="space-y-4"
      >
        <div>
          <h2
            id="application-settings-heading"
            className="text-lg font-bold text-slate-950"
          >
            Application settings
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Configure how the application behaves for your account.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
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
                <h3 className="font-bold text-slate-950">
                  Notification preferences
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Manage notification categories, delivery methods,
                  badge behavior, sounds, and desktop alerts.
                </p>
              </div>
            </div>

            <ChevronRight className="size-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
          </Link>
        </div>
      </section>
    </div>
  )
}