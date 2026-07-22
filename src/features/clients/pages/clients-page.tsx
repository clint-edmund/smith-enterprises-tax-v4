import {
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react"
import {
  useCallback,
  useEffect,
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

export function ClientsPage() {
  const { profile } = useAuth()

  const [clients, setClients] =
    useState<ClientListItem[]>([])

  const [searchText, setSearchText] =
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
        const result =
          await searchClients(
            search,
            status,
          )

        setClients(result)
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
    const timeoutId =
      window.setTimeout(() => {
        void loadClients(
          "",
          "active",
        )
      }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadClients])

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    void loadClients(
      searchText,
      statusFilter,
    )
  }

  const canCreate =
    Boolean(
      profile &&
        createRoles.includes(
          profile.role,
        ),
    )

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Client Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Clients
          </h1>

          <p className="mt-2 text-slate-600">
            Search, review, create, and maintain
            taxpayer client records.
          </p>
        </div>

        {canCreate && (
          <Link
            to={appConfig.routes.clientNew}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
          >
            <Plus
              className="size-5"
              aria-hidden="true"
            />

            New Client
          </Link>
        )}
      </header>

      <form
        onSubmit={handleSearchSubmit}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_auto]"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-3 size-5 text-slate-400"
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
            placeholder="Search name, email, phone, or client number"
            aria-label="Search clients"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          aria-label="Filter clients by status"
          onChange={(event) => {
            const nextStatus =
              event.target.value as StatusFilter

            setStatusFilter(nextStatus)

            void loadClients(
              searchText,
              nextStatus,
            )
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        >
          <option value="all">
            All statuses
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>

          <option value="archived">
            Archived
          </option>
        </select>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          <Search
            className="size-4"
            aria-hidden="true"
          />

          Search
        </button>
      </form>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"
        >
          <p>{errorMessage}</p>

          <button
            type="button"
            onClick={() => {
              void loadClients(
                searchText,
                statusFilter,
              )
            }}
            className="mt-4 inline-flex items-center gap-2 font-semibold"
          >
            <RefreshCw
              className="size-4"
              aria-hidden="true"
            />

            Try Again
          </button>
        </div>
      )}

      {!errorMessage && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-10 text-center text-slate-600">
              Loading clients...
            </div>
          ) : clients.length === 0 ? (
            <div className="p-10 text-center">
              <Users
                className="mx-auto size-10 text-slate-400"
                aria-hidden="true"
              />

              <h2 className="mt-4 font-bold text-slate-900">
                No clients found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Adjust the search or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Client
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Contact
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Location
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">
                          {formatClientName(client)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatClientNumber(
                            client.clientNumber,
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        <p>
                          {client.email ||
                            "No email"}
                        </p>

                        <p className="mt-1 text-slate-500">
                          {client.phone ||
                            "No phone"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {[client.city, client.state]
                          .filter(Boolean)
                          .join(", ") ||
                          "Not provided"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                          {client.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={getClientDetailsRoute(
                            client.id,
                          )}
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </section>
  )
}
