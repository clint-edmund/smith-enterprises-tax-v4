import {
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  AtlasCard,
  AtlasStatusPill,
} from "@/components/atlas-ui"
import {
  getStaffAdminAuditHistory,
} from "@/features/staff/services/staff-service"
import type {
  StaffAdminAuditEvent,
} from "@/features/staff/types/staff.types"

type ActionFilter =
  | "all"
  | "staff_invited"
  | "role_changed"
  | "activated"
  | "deactivated"
  | "password_reset_requested"

const actionLabels: Record<
  Exclude<ActionFilter, "all">,
  string
> = {
  staff_invited: "Staff Invitation",
  role_changed: "Role Change",
  activated: "Account Activated",
  deactivated: "Account Deactivated",
  password_reset_requested:
    "Password Reset",
}

function formatRole(
  role:
    | StaffAdminAuditEvent["newRole"]
    | StaffAdminAuditEvent["previousRole"],
): string {
  if (!role) {
    return "—"
  }

  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (value) =>
      value.toUpperCase(),
    )
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date)
}

function getActorName(
  event: StaffAdminAuditEvent,
): string {
  return (
    event.actorDisplayName ||
    event.actorEmail
  )
}

function getActionLabel(
  action: string,
): string {
  if (action in actionLabels) {
    return actionLabels[
      action as Exclude<
        ActionFilter,
        "all"
      >
    ]
  }

  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (value) =>
      value.toUpperCase(),
    )
}

function describeEvent(
  event: StaffAdminAuditEvent,
): string {
  const actor =
    getActorName(event)
  const target =
    event.targetEmail ||
    "staff account"

  switch (event.action) {
    case "staff_invited":
      return `${actor} invited ${target} as ${formatRole(
        event.newRole,
      )}.`

    case "role_changed":
      return `${actor} changed ${target} from ${formatRole(
        event.previousRole,
      )} to ${formatRole(
        event.newRole,
      )}.`

    case "activated":
      return `${actor} activated ${target}.`

    case "deactivated":
      return `${actor} deactivated ${target}.`

    case "password_reset_requested":
      return `${actor} requested a password reset for ${target}.`

    default:
      return `${actor} performed ${getActionLabel(
        event.action,
      )} for ${target}.`
  }
}

export function StaffAdministrationActivity() {
  const [events, setEvents] =
    useState<StaffAdminAuditEvent[]>([])
  const [isLoading, setIsLoading] =
    useState(true)
  const [isRefreshing, setIsRefreshing] =
    useState(false)
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)
  const [searchText, setSearchText] =
    useState("")
  const [actionFilter, setActionFilter] =
    useState<ActionFilter>("all")

  const loadEvents =
    useCallback(
      async (
        showRefreshing = false,
      ) => {
        if (showRefreshing) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        setErrorMessage(null)

        try {
          setEvents(
            await getStaffAdminAuditHistory(
              100,
            ),
          )
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load administrative activity.",
          )
        } finally {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      },
      [],
    )

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  const filteredEvents =
    useMemo(() => {
      const search =
        searchText
          .trim()
          .toLowerCase()

      return events.filter(
        (event) => {
          if (
            actionFilter !== "all" &&
            event.action !==
              actionFilter
          ) {
            return false
          }

          if (!search) {
            return true
          }

          return [
            getActorName(event),
            event.actorEmail,
            event.targetEmail ?? "",
            getActionLabel(
              event.action,
            ),
            describeEvent(event),
          ].some((value) =>
            value
              .toLowerCase()
              .includes(search),
          )
        },
      )
    }, [
      actionFilter,
      events,
      searchText,
    ])

  return (
    <AtlasCard
      padding="none"
      className="overflow-hidden"
    >
      <div className="border-b border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="size-5 text-blue-700"
                aria-hidden="true"
              />
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                Administrative Activity
              </h2>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review recent staff invitations, role changes,
              activation changes, and password-reset requests.
            </p>
          </div>

          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => {
              void loadEvents(true)
            }}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={[
                "size-4",
                isRefreshing
                  ? "animate-spin"
                  : "",
              ].join(" ")}
              aria-hidden="true"
            />
            Refresh Activity
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-3 size-4.5 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(
                  event.target.value,
                )
              }}
              placeholder="Search actor, staff member, or action..."
              aria-label="Search administrative activity"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(event) => {
              setActionFilter(
                event.target
                  .value as ActionFilter,
              )
            }}
            aria-label="Filter administrative activity"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">
              All Actions
            </option>
            {Object.entries(
              actionLabels,
            ).map(
              ([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-6">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : errorMessage ? (
        <div className="p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-900">
              Unable to load administrative activity
            </p>
            <p className="mt-2 text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <Clock3
            className="mx-auto size-10 text-slate-300"
            aria-hidden="true"
          />
          <h3 className="mt-4 font-semibold text-slate-950">
            No administrative activity found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {events.length === 0
              ? "Staff administration events will appear here as actions are performed."
              : "Try changing your search or action filter."}
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100">
            {filteredEvents.map(
              (event) => (
                <article
                  key={event.id}
                  className="p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <AtlasStatusPill
                          tone={
                            event.outcome === "success"
                              ? "success"
                              : "warning"
                          }
                        >
                          {getActionLabel(
                            event.action,
                          )}
                        </AtlasStatusPill>
                        <span className="text-xs font-medium text-slate-400">
                          {event.outcome}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">
                        {describeEvent(event)}
                      </p>

                      {event.action === "role_changed" && (
                        <p className="mt-2 text-sm text-slate-500">
                          Role:{" "}
                          {formatRole(
                            event.previousRole,
                          )}{" "}
                          →{" "}
                          {formatRole(
                            event.newRole,
                          )}
                        </p>
                      )}

                      {(event.action === "activated" ||
                        event.action === "deactivated") && (
                        <p className="mt-2 text-sm text-slate-500">
                          Access:{" "}
                          {event.previousIsActive
                            ? "Active"
                            : "Inactive"}{" "}
                          →{" "}
                          {event.newIsActive
                            ? "Active"
                            : "Inactive"}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-sm text-slate-500 lg:text-right">
                      <p className="font-medium text-slate-700">
                        {formatDateTime(
                          event.createdAt,
                        )}
                      </p>
                      <p className="mt-1 text-xs">
                        Actor: {event.actorEmail}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>

          <footer className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
            Showing {filteredEvents.length} of{" "}
            {events.length} recent{" "}
            {events.length === 1
              ? "event"
              : "events"}.
          </footer>
        </>
      )}
    </AtlasCard>
  )
}
