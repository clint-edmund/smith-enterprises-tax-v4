import {
  ArrowLeft,
  CalendarClock,
  Edit3,
  Hash,
  ShieldCheck,
} from "lucide-react"
import {
  useEffect,
  useState,
} from "react"
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom"

import {
  appConfig,
  getClientDetailsRoute,
} from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ClientForm } from "@/features/clients/components/client-form"
import {
  getClientById,
  updateClient,
} from "@/features/clients/services/client-service"
import type {
  ClientFormValues,
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

function mapClientToForm(
  client: ClientRecord,
): ClientFormValues {
  return {
    firstName: client.firstName,
    middleName:
      client.middleName ?? "",
    lastName: client.lastName,
    preferredName:
      client.preferredName ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    alternatePhone:
      client.alternatePhone ?? "",
    addressLine1:
      client.addressLine1 ?? "",
    addressLine2:
      client.addressLine2 ?? "",
    city: client.city ?? "",
    state: client.state ?? "",
    postalCode:
      client.postalCode ?? "",
    birthDate:
      client.birthDate ?? "",
    status: client.status,
    notes: client.notes ?? "",
  }
}

export function EditClientPage() {
  const navigate = useNavigate()
  const { clientId } = useParams()
  const { profile } = useAuth()

  const [client, setClient] =
    useState<ClientRecord | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

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

  if (
    !profile ||
    !editRoles.includes(profile.role)
  ) {
    return (
      <Navigate
        to={appConfig.routes.clients}
        replace
      />
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
        <p className="mt-4 font-semibold text-slate-700">
          Loading client...
        </p>
      </div>
    )
  }

  if (!client || !clientId) {
    return (
      <section className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
          Client Error
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Client unavailable
        </h1>

        <p className="mt-3 text-slate-600">
          {errorMessage ??
            "The client record could not be loaded."}
        </p>

        <Link
          to={appConfig.routes.clients}
          className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />
          Return to Clients
        </Link>
      </section>
    )
  }

  const currentClient = client

  async function handleSubmit(
    values: ClientFormValues,
  ) {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await updateClient(
        currentClient.id,
        values,
      )

      navigate(
        getClientDetailsRoute(
          currentClient.id,
        ),
        {
          replace: true,
        },
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update client.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-slate-50 px-5 py-5 sm:px-7">
          <Link
            to={getClientDetailsRoute(
              client.id,
            )}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />
            Back to Client
          </Link>
        </div>

        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Edit3
                className="size-7"
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  Edit {formatClientName(currentClient)}
                </h1>

                <span
                  className={[
                    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                    currentClient.status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : currentClient.status === "inactive"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-slate-200 bg-slate-100 text-slate-700",
                  ].join(" ")}
                >
                  {currentClient.status}
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Update the client&apos;s core profile, contact information,
                address, status, and internal office notes.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <Hash
                    className="size-3.5"
                    aria-hidden="true"
                  />
                  {formatClientNumber(
                    currentClient.clientNumber,
                  )}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <CalendarClock
                    className="size-3.5"
                    aria-hidden="true"
                  />
                  Updated {formatDate(currentClient.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 lg:max-w-sm">
            <div className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-blue-700"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Audited client changes
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-800">
                  Save only verified updates. Changes to this record may be
                  reflected in audit and activity history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <ClientForm
        defaultValues={mapClientToForm(
          currentClient,
        )}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={() => {
          navigate(
            getClientDetailsRoute(
              currentClient.id,
            ),
          )
        }}
      />
    </section>
  )
}
