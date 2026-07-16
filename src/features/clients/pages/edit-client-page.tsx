import {
  ArrowLeft,
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
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Loading client...
      </div>
    )
  }

  if (!client || !clientId) {
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
        className="mt-6 inline-flex font-semibold text-blue-700 hover:underline"
      >
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
      <header>
        <Link
          to={getClientDetailsRoute(
            currentClient.id,
          )}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Back to Client
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">
          Edit Client
        </h1>

        <p className="mt-2 text-slate-600">
          Update the client record and save the
          changes to the audit history.
        </p>
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
