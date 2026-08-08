import {
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  LoaderCircle,
  Mail,
  Monitor,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  getNotificationPreferences,
  restoreDefaultNotificationPreferences,
  updateNotificationPreferences,
} from "../services/notification-preference-service"

import type {
  NotificationPreferenceUpdates,
  NotificationPreferences,
} from "../types/notification-preference.types"

import {
  PreferenceToggle,
} from "./preference-toggle"

type SaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "error"

function getEditablePreferences(
  preferences:
    NotificationPreferences,
): NotificationPreferenceUpdates {
  return {
    assignmentNotifications:
      preferences.assignmentNotifications,

    clientNotifications:
      preferences.clientNotifications,

    returnNotifications:
      preferences.returnNotifications,

    paymentNotifications:
      preferences.paymentNotifications,

    systemNotifications:
      preferences.systemNotifications,

    highPriorityNotifications:
      preferences.highPriorityNotifications,

    securityNotifications:
      preferences.securityNotifications,

    browserNotifications:
      preferences.browserNotifications,

    emailNotifications:
      preferences.emailNotifications,

    dailyDigest:
      preferences.dailyDigest,

    weeklyDigest:
      preferences.weeklyDigest,

    quietHoursEnabled:
      preferences.quietHoursEnabled,

    quietHoursStart:
      preferences.quietHoursStart,

    quietHoursEnd:
      preferences.quietHoursEnd,

    badgeCounter:
      preferences.badgeCounter,

    notificationSound:
      preferences.notificationSound,

    desktopToasts:
      preferences.desktopToasts,

    autoMarkRead:
      preferences.autoMarkRead,

    retentionDays:
      preferences.retentionDays,
  }
}

export function NotificationPreferencesPanel() {
  const [
    preferences,
    setPreferences,
  ] = useState<
    NotificationPreferenceUpdates | null
  >(null)

  const [
    savedPreferences,
    setSavedPreferences,
  ] = useState<
    NotificationPreferenceUpdates | null
  >(null)

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isRestoring,
    setIsRestoring,
  ] = useState(false)

  const [
    saveStatus,
    setSaveStatus,
  ] = useState<SaveStatus>("idle")

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadPreferences() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result =
          await getNotificationPreferences()

        if (!isMounted) {
          return
        }

        const editablePreferences =
          getEditablePreferences(result)

        setPreferences(
          editablePreferences,
        )

        setSavedPreferences(
          editablePreferences,
        )
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Notification preferences could not be loaded.",
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPreferences()

    return () => {
      isMounted = false
    }
  }, [])

  const hasChanges = useMemo(() => {
    if (
      !preferences ||
      !savedPreferences
    ) {
      return false
    }

    return (
      JSON.stringify(preferences) !==
      JSON.stringify(savedPreferences)
    )
  }, [
    preferences,
    savedPreferences,
  ])

  function updatePreference<
    Key extends keyof NotificationPreferenceUpdates,
  >(
    key: Key,
    value:
      NotificationPreferenceUpdates[Key],
  ) {
    setPreferences((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        [key]: value,
      }
    })

    setSaveStatus("idle")
    setErrorMessage(null)
  }

  async function handleSave() {
    if (
      !preferences ||
      !hasChanges
    ) {
      return
    }

    try {
      setSaveStatus("saving")
      setErrorMessage(null)

      const result =
        await updateNotificationPreferences(
          preferences,
        )

      const updatedPreferences =
        getEditablePreferences(result)

      setPreferences(
        updatedPreferences,
      )

      setSavedPreferences(
        updatedPreferences,
      )

      setSaveStatus("saved")
    } catch (error) {
      setSaveStatus("error")

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Notification preferences could not be saved.",
      )
    }
  }

  async function handleRestoreDefaults() {
    try {
      setIsRestoring(true)
      setSaveStatus("idle")
      setErrorMessage(null)

      const result =
        await restoreDefaultNotificationPreferences()

      const defaultPreferences =
        getEditablePreferences(result)

      setPreferences(
        defaultPreferences,
      )

      setSavedPreferences(
        defaultPreferences,
      )

      setSaveStatus("saved")
    } catch (error) {
      setSaveStatus("error")

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Default preferences could not be restored.",
      )
    } finally {
      setIsRestoring(false)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex min-h-48 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto size-7 animate-spin text-blue-700" />

            <p className="mt-3 text-sm text-slate-600">
              Loading notification
              preferences...
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (!preferences) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-950">
          Notification preferences
          unavailable
        </h2>

        <p className="mt-2 text-sm text-red-800">
          {errorMessage ??
            "The preferences could not be loaded."}
        </p>
      </section>
    )
  }

  const isBusy =
    saveStatus === "saving" ||
    isRestoring

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Bell className="size-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Notification
                  preferences
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Choose which alerts
                  you receive and how
                  they are delivered.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
              onClick={() => {
                void handleRestoreDefaults()
              }}
              type="button"
            >
              {isRestoring ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}

              Restore defaults
            </button>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={
                isBusy ||
                !hasChanges
              }
              onClick={() => {
                void handleSave()
              }}
              type="button"
            >
              {saveStatus ===
              "saving" ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : saveStatus ===
                "saved" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Save className="size-4" />
              )}

              {saveStatus ===
              "saving"
                ? "Saving..."
                : saveStatus ===
                    "saved"
                  ? "Saved"
                  : "Save changes"}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {hasChanges && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            You have unsaved
            notification preference
            changes.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-bold text-slate-950">
          Notification categories
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Control which types of
          activity generate
          notifications.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <PreferenceToggle
            checked={
              preferences
                .assignmentNotifications
            }
            description="Receive alerts when a return, client, or task is assigned to you."
            icon={BriefcaseBusiness}
            label="Assignments"
            onChange={(checked) => {
              updatePreference(
                "assignmentNotifications",
                checked,
              )
            }}
          />

          <PreferenceToggle
            checked={
              preferences
                .clientNotifications
            }
            description="Receive notifications for new clients and important client-record changes."
            icon={UserRound}
            label="Client activity"
            onChange={(checked) => {
              updatePreference(
                "clientNotifications",
                checked,
              )
            }}
          />

          <PreferenceToggle
            checked={
              preferences
                .returnNotifications
            }
            description="Receive alerts when tax-return status or workflow details change."
            icon={Bell}
            label="Tax returns"
            onChange={(checked) => {
              updatePreference(
                "returnNotifications",
                checked,
              )
            }}
          />

          <PreferenceToggle
            checked={
              preferences
                .paymentNotifications
            }
            description="Receive alerts for payments, balances, refunds, and account activity."
            icon={CircleDollarSign}
            label="Payments"
            onChange={(checked) => {
              updatePreference(
                "paymentNotifications",
                checked,
              )
            }}
          />

          <PreferenceToggle
            checked={
              preferences
                .systemNotifications
            }
            description="Receive service announcements, maintenance notices, and system updates."
            icon={Monitor}
            label="System alerts"
            onChange={(checked) => {
              updatePreference(
                "systemNotifications",
                checked,
              )
            }}
          />

          <PreferenceToggle
            checked={
              preferences
                .highPriorityNotifications
            }
            description="Receive alerts categorized as high or critical priority."
            icon={Bell}
            label="High-priority alerts"
            onChange={(checked) => {
              updatePreference(
                "highPriorityNotifications",
                checked,
              )
            }}
          />

          <PreferenceToggle
            checked={
              preferences
                .securityNotifications
            }
            description="Security and account-protection alerts cannot be disabled."
            disabled
            icon={ShieldCheck}
            label="Security alerts"
            onChange={() => {
              // Intentionally locked.
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-bold text-slate-950">
          Delivery methods
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Select how notifications
          should be delivered.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <PreferenceToggle
            checked
            description="Notifications are displayed inside the Smith Enterprises application."
            disabled
            icon={Bell}
            label="In-app notifications"
            onChange={() => {
              // In-app delivery is required.
            }}
          />

          <PreferenceToggle
            checked={
              preferences
                .browserNotifications
            }
            description="Allow browser notifications when the application is open."
            icon={Monitor}
            label="Browser notifications"
            onChange={(checked) => {
              updatePreference(
                "browserNotifications",
                checked,
              )
            }}
          />

          <PreferenceToggle
            checked={
              preferences
                .emailNotifications
            }
            description="Receive eligible notifications at your account email address."
            icon={Mail}
            label="Email notifications"
            onChange={(checked) => {
              updatePreference(
                "emailNotifications",
                checked,
              )
            }}
          />

          <PreferenceToggle
            checked={
              preferences
                .desktopToasts
            }
            description="Display temporary notification messages while using the application."
            icon={Monitor}
            label="Desktop toasts"
            onChange={(checked) => {
              updatePreference(
                "desktopToasts",
                checked,
              )
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-bold text-slate-950">
          Notification behavior
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          Customize how notifications
          behave inside the
          application.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <PreferenceToggle
            checked={
              preferences.badgeCounter
            }
            description="Show the number of unread notifications on the notification bell."
            icon={Bell}
            label="Unread badge counter"
            onChange={(checked) => {
              updatePreference(
                "badgeCounter",
                checked,
              )
            }}
          />

          <PreferenceToggle
            checked={
              preferences
                .notificationSound
            }
            description="Play a sound when an eligible notification arrives."
            icon={Bell}
            label="Notification sound"
            onChange={(checked) => {
              updatePreference(
                "notificationSound",
                checked,
              )
            }}
          />

          <PreferenceToggle
            checked={
              preferences.autoMarkRead
            }
            description="Mark a notification as read automatically after opening it."
            icon={CheckCircle2}
            label="Automatically mark as read"
            onChange={(checked) => {
              updatePreference(
                "autoMarkRead",
                checked,
              )
            }}
          />
        </div>
      </div>
    </section>
  )
}