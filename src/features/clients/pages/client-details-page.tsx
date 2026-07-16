import {
  ArrowLeft,
  Edit3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"
import {
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

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadClient() {
      if (!clientId) {
        setErrorMessage(
          "The client identifier is missing.",
        )
        setIsLoading(false)
        return
      }

      try {
        const result =
          await getClientById(clientId)

        if (!result) {
          setErrorMessage(
            "The client record was not found.",
          )
          return
        }

        setClient(result)
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the client.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadClient()
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
          {errorMessage}
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
    profile &&
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

        {canEdit && (
          <Link
            to={getClientEditRoute(client.id)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
          >
            <Edit3 className="size-4" />
            Edit Client
          </Link>
        )}
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
                {formatDate(
                  client.birthDate,
                )}
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
                    Alternate:{" "}
                    {client.alternatePhone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-5 text-slate-400" />

              <div className="text-slate-700">
                {client.addressLine1 ? (
                  <>
                    <p>
                      {client.addressLine1}
                    </p>

                    {client.addressLine2 && (
                      <p>
                        {client.addressLine2}
                      </p>
                    )}

                    <p>
                      {[
                        client.city,
                        client.state,
                      ]
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

      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
        <h2 className="font-bold text-slate-950">
          Client Returns
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Tax returns associated with this client
          will appear here during Phase 8.
        </p>
      </section>
    </section>
  )
}