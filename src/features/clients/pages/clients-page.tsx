import {
  Archive,
  CheckCircle2,
  ChevronRight,
  CircleOff,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"
import {
  Link,
} from "react-router-dom"

import {
  appConfig,
  getClientDetailsRoute,
} from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import type { AppRole } from "@/features/auth/types/auth.types"
import { searchClients } from "@/features/clients/services/client-service"
import type {
  ClientListItem,
  ClientStatus,
} from "@/features/clients/types/client.types"
import {
  formatClientName,
  formatClientNumber,
} from "@/features/clients/utils/client-formatters"

type StatusFilter =
  | ClientStatus
  | "all"

const createRoles: AppRole[] = [
  "administrator",
  "manager",
  "receptionist",
]

const statusOptions: Array<{
  value: StatusFilter
  label: string
}> = [
  { value: "active", label: "Active" },
  { value: "all", label: "All Clients" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
]

function getStatusBadgeClasses(
  status: ClientStatus,
): string {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-800"
    case "inactive":
      return "border-amber-200 bg-amber-50 text-amber-800"
    case "archived":
      return "border-slate-300 bg-slate-100 text-slate-700"
    default:
      return "border-slate-300 bg-slate-100 text-slate-700"
  }
}

function getStatusIcon(
  status: ClientStatus,
) {
  switch (status) {
    case "active":
      return CheckCircle2
    case "inactive":
      return CircleOff
    case "archived":
      return Archive
    default:
      return Users
  }
}

export function ClientsPage() {
  const { profile } = useAuth()

  const [clients, setClients] =
    useState<ClientListItem[]>([])

  const [searchText, setSearchText] =
    useState("")

  const [appliedSearch, setAppliedSearch] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("active")

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const loadClients = useCallback(
    async (
      search: string,
      status: StatusFilter,
    ) => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await searchClients(
          search,
          status,
        )

        setClients(result)
        setAppliedSearch(search.trim())
      } catch (error) {
        console.error(
          "Unable to load clients:",
          error,
        )

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load clients.",
        )
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadClients("", "active")
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadClients])

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    void loadClients(searchText, statusFilter)
  }

  function handleClearSearch() {
    setSearchText("")
    void loadClients("", statusFilter)
  }

  const canCreate = Boolean(
    profile &&
      createRoles.includes(profile.role),
  )

  const statusCounts = useMemo(() => {
    return clients.reduce(
      (counts, client) => {
        counts[client.status] += 1
        return counts
      },
      {
        active: 0,
        inactive: 0,
        archived: 0,
      },
    )
  }, [clients])

  const resultDescription = useMemo(() => {
    const clientWord =
      clients.length === 1 ? "client" : "clients"

    if (appliedSearch) {
      return `${clients.length} ${clientWord} found for “${appliedSearch}”`
    }

    return `${clients.length} ${clientWord} displayed`
  }, [appliedSearch, clients.length])

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
              <Users className="size-4" aria-hidden="true" />
              Client Management
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Clients
            </h1>

            <p className="mt-3 text-base leading-7 text-slate-600">
              Search, review, create, and maintain taxpayer
              client records from one central workspace.
            </p>
          </div>

          {canCreate && (
            <Link
              to={appConfig.routes.clientNew}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            >
              <Plus className="size-5" aria-hidden="true" />
              New Client
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-700">Active shown</p>
            <p className="mt-2 text-2xl font-bold text-emerald-950">{statusCounts.active}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-700">Inactive shown</p>
            <p className="mt-2 text-2xl font-bold text-amber-950">{statusCounts.inactive}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-600">Archived shown</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{statusCounts.archived}</p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form
          onSubmit={handleSearchSubmit}
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value)
              }}
              placeholder="Search name, email, phone, or client number"
              aria-label="Search clients"
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />

            {searchText && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear client search"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="size-4" aria-hidden="true" />
            Search
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const isSelected = statusFilter === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStatusFilter(option.value)
                  void loadClients(searchText, option.value)
                }}
                className={[
                  "inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                  isSelected
                    ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
                ].join(" ")}
                aria-pressed={isSelected}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm"
        >
          <p className="font-semibold">Unable to load clients</p>
          <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              void loadClients(searchText, statusFilter)
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try Again
          </button>
        </div>
      )}

      {!errorMessage && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-950">Client Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isLoading ? "Loading client records..." : resultDescription}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void loadClients(searchText, statusFilter)
              }}
              disabled={isLoading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={["size-4", isLoading ? "animate-spin" : ""].join(" ")}
                aria-hidden="true"
              />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100">
                <Users className="size-8 text-slate-400" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-950">No clients found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try another search term or select a different client status.
              </p>

              {(searchText || statusFilter !== "active") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchText("")
                    setStatusFilter("active")
                    void loadClients("", "active")
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <X className="size-4" aria-hidden="true" />
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Client</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Contact</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Location</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Status</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {clients.map((client) => {
                      const StatusIcon = getStatusIcon(client.status)

                      return (
                        <tr
                          key={client.id}
                          className="group transition hover:bg-blue-50/40"
                        >
                          <td className="px-5 py-4">
                            <Link
                              to={getClientDetailsRoute(client.id)}
                              className="inline-flex flex-col focus-visible:outline-none"
                            >
                              <span className="font-semibold text-slate-950 transition group-hover:text-blue-800">
                                {formatClientName(client)}
                              </span>
                              <span className="mt-1 text-xs font-medium text-slate-500">
                                {formatClientNumber(client.clientNumber)}
                              </span>
                            </Link>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            <p className="max-w-64 truncate">{client.email || "No email"}</p>
                            <p className="mt-1 text-slate-500">{client.phone || "No phone"}</p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {[client.city, client.state].filter(Boolean).join(", ") || "Not provided"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={[
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                                getStatusBadgeClasses(client.status),
                              ].join(" ")}
                            >
                              <StatusIcon className="size-3.5" aria-hidden="true" />
                              {client.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              to={getClientDetailsRoute(client.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 hover:text-blue-900"
                            >
                              View Client
                              <ChevronRight className="size-4" aria-hidden="true" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-200 md:hidden">
                {clients.map((client) => {
                  const StatusIcon = getStatusIcon(client.status)

                  return (
                    <article key={client.id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-950">
                            {formatClientName(client)}
                          </h3>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {formatClientNumber(client.clientNumber)}
                          </p>
                        </div>

                        <span
                          className={[
                            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                            getStatusBadgeClasses(client.status),
                          ].join(" ")}
                        >
                          <StatusIcon className="size-3.5" aria-hidden="true" />
                          {client.status}
                        </span>
                      </div>

                      <dl className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
                          <dd className="mt-1 break-words font-medium text-slate-800">{client.email || "No email provided"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Phone</dt>
                          <dd className="mt-1 font-medium text-slate-800">{client.phone || "No phone provided"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</dt>
                          <dd className="mt-1 font-medium text-slate-800">
                            {[client.city, client.state].filter(Boolean).join(", ") || "Not provided"}
                          </dd>
                        </div>
                      </dl>

                      <Link
                        to={getClientDetailsRoute(client.id)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        View Client
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </Link>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </section>
      )}
    </section>
  )
}
