import {
  ArrowLeft,
  Edit3,
  FilePlus2,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useState,
} from "react"
import {
  Link,
  useParams,
} from "react-router-dom"

import {
  appConfig,
  getClientEditRoute,
  getNewClientReturnRoute,
  getReturnDetailsRoute,
} from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { getClientById } from "@/features/clients/services/client-service"
import type {
  ClientRecord,
} from "@/features/clients/types/client.types"
import {
  formatClientName,
  formatClientNumber,
  formatDate,
} from "@/features/clients/utils/client-formatters"
import { ReturnStatusBadge } from "@/features/returns/components/return-status-badge"
import { getClientTaxReturns } from "@/features/returns/services/return-service"
import type {
  ClientTaxReturnItem,
} from "@/features/returns/types/return.types"
import {
  formatReturnCurrency,
  formatReturnDate,
  returnTypeLabels,
  taxFormLabels,
} from "@/features/returns/utils/return-formatters"

const editRoles = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
]

export function ClientDetailsPage() {
  const { clientId } = useParams()
  const { profile } = useAuth()

  const [client, setClient] =
    useState<ClientRecord | null>(null)

  const [clientReturns, setClientReturns] =
    useState<ClientTaxReturnItem[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [isRefreshingReturns, setIsRefreshingReturns] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [returnsErrorMessage, setReturnsErrorMessage] =
    useState<string | null>(null)

  const loadClientReturns = useCallback(
    async (showRefreshing = false) => {
      if (!clientId) {
        return
      }

      if (showRefreshing) {
        setIsRefreshingReturns(true)
      }

      setReturnsErrorMessage(null)

      try {
        const results =
          await getClientTaxReturns(clientId)

        setClientReturns(results)
      } catch (error) {
        console.error(
          "Unable to load client returns:",
          error,
        )

        setReturnsErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this client's returns.",
        )
      } finally {
        setIsRefreshingReturns(false)
      }
    },
    [clientId],
  )

  useEffect(() => {
    async function loadPage() {
      if (!clientId) {
        setErrorMessage(
          "The client identifier is missing.",
        )
        setIsLoading(false)
        return
      }

      setErrorMessage(null)

      try {
        const [clientResult, returnResults] =
          await Promise.all([
            getClientById(clientId),
            getClientTaxReturns(clientId),
          ])

        if (!clientResult) {
          setErrorMessage(
            "The client record was not found.",
          )
          return
        }

        setClient(clientResult)
        setClientReturns(returnResults)
      } catch (error) {
        console.error(
          "Unable to load client details:",
          error,
        )

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the client.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadPage()
  }, [clientId])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Loading client...
      </div>
    )
  }

  if (errorMessage || !client) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-slate-950">
          Client unavailable
        </h1>

        <p className="mt-3 text-slate-600">
          {errorMessage ??
            "The client record could not be loaded."}
        </p>

        <Link
          to={appConfig.routes.clients}
          className="mt-6 inline-flex font-semibold text-blue-700"
        >
          Return to Clients
        </Link>
      </section>
    )
  }

  const canEdit =
    profile !== null &&
    editRoles.includes(profile.role)

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to={appConfig.routes.clients}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to Clients
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-950">
            {formatClientName(client)}
          </h1>

          <p className="mt-2 text-slate-500">
            {formatClientNumber(
              client.clientNumber,
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {canEdit && (
            <Link
              to={getNewClientReturnRoute(client.id)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-700 bg-white px-4 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            >
              <FilePlus2 className="size-4" />
              New Return
            </Link>
          )}

          {canEdit && (
            <Link
              to={getClientEditRoute(client.id)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
            >
              <Edit3 className="size-4" />
              Edit Client
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">
            Client information
          </h2>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">
                Status
              </dt>
              <dd className="mt-1 font-semibold capitalize text-slate-950">
                {client.status}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Birth date
              </dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {formatDate(client.birthDate)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Preferred name
              </dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {client.preferredName ||
                  "Not provided"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">
            Contact information
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex gap-3">
              <Mail className="mt-0.5 size-5 text-slate-400" />
              <p className="text-slate-700">
                {client.email ||
                  "No email provided"}
              </p>
            </div>

            <div className="flex gap-3">
              <Phone className="mt-0.5 size-5 text-slate-400" />
              <div>
                <p className="text-slate-700">
                  {client.phone ||
                    "No primary phone"}
                </p>

                {client.alternatePhone && (
                  <p className="mt-1 text-sm text-slate-500">
                    Alternate: {client.alternatePhone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-5 text-slate-400" />
              <div className="text-slate-700">
                {client.addressLine1 ? (
                  <>
                    <p>{client.addressLine1}</p>
                    {client.addressLine2 && (
                      <p>{client.addressLine2}</p>
                    )}
                    <p>
                      {[client.city, client.state]
                        .filter(Boolean)
                        .join(", ")}
                      {client.postalCode
                        ? ` ${client.postalCode}`
                        : ""}
                    </p>
                  </>
                ) : (
                  <p>No address provided</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-950">
          Internal notes
        </h2>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {client.notes ||
            "No internal notes have been recorded."}
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-950">
              Client Returns
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tax returns associated with this client.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                void loadClientReturns(true)
              }}
              disabled={isRefreshingReturns}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`size-4 ${
                  isRefreshingReturns
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>

            {canEdit && (
              <Link
                to={getNewClientReturnRoute(client.id)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <FilePlus2 className="size-4" />
                New Return
              </Link>
            )}
          </div>
        </div>

        {returnsErrorMessage ? (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-900">
              Unable to load client returns
            </p>
            <p className="mt-2 text-sm text-red-700">
              {returnsErrorMessage}
            </p>
          </div>
        ) : clientReturns.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="mx-auto size-10 text-slate-300" />
            <h3 className="mt-4 font-bold text-slate-950">
              No returns found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              This client does not have any tax returns yet.
            </p>

            {canEdit && (
              <Link
                to={getNewClientReturnRoute(client.id)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800"
              >
                <FilePlus2 className="size-4" />
                Create First Return
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Return
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Assignment
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Dates
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Net Fee
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {clientReturns.map((taxReturn) => (
                    <tr
                      key={taxReturn.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">
                          {taxReturn.taxYear}{" "}
                          {taxFormLabels[taxReturn.taxForm]}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {returnTypeLabels[taxReturn.returnType]}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <ReturnStatusBadge
                          status={taxReturn.status}
                        />
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        <p>
                          Preparer: {taxReturn.assignedPreparerName || "Unassigned"}
                        </p>
                        <p className="mt-1 text-slate-500">
                          Reviewer: {taxReturn.assignedReviewerName || "Unassigned"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        <p>
                          Received: {formatReturnDate(taxReturn.dateReceived)}
                        </p>
                        <p className="mt-1 text-slate-500">
                          Due: {formatReturnDate(taxReturn.dueDate)}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-slate-950">
                        {formatReturnCurrency(taxReturn.netFee)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={getReturnDetailsRoute(taxReturn.id)}
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

            <div className="divide-y divide-slate-200 md:hidden">
              {clientReturns.map((taxReturn) => (
                <article
                  key={taxReturn.id}
                  className="space-y-4 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {taxReturn.taxYear}{" "}
                        {taxFormLabels[taxReturn.taxForm]}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {returnTypeLabels[taxReturn.returnType]}
                      </p>
                    </div>
                    <ReturnStatusBadge
                      status={taxReturn.status}
                    />
                  </div>

                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-slate-500">
                        Preparer
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {taxReturn.assignedPreparerName || "Unassigned"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">
                        Net fee
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {formatReturnCurrency(taxReturn.netFee)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">
                        Received
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {formatReturnDate(taxReturn.dateReceived)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">
                        Due
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {formatReturnDate(taxReturn.dueDate)}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    to={getReturnDetailsRoute(taxReturn.id)}
                    className="inline-flex font-semibold text-blue-700 hover:underline"
                  >
                    View Return
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </section>
  )
}
