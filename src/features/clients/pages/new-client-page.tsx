import {
  ArrowLeft,
} from "lucide-react"
import {
  useState,
} from "react"
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom"

import {
  appConfig,
  getClientDetailsRoute,
} from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ClientForm } from "@/features/clients/components/client-form"
import { createClient } from "@/features/clients/services/client-service"
import type {
  ClientFormValues,
} from "@/features/clients/types/client.types"

const createRoles = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
]

export function NewClientPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  if (
    !profile ||
    !createRoles.includes(profile.role)
  ) {
    return (
      <Navigate
        to={appConfig.routes.clients}
        replace
      />
    )
  }

  async function handleSubmit(
    values: ClientFormValues,
  ) {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const client =
        await createClient(values)

      navigate(
        getClientDetailsRoute(client.id),
        {
          replace: true,
        },
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create client.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <Link
          to={appConfig.routes.clients}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Clients
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">
          New Client
        </h1>

        <p className="mt-2 text-slate-600">
          Create a new taxpayer client record.
        </p>
      </header>

      <ClientForm
        submitLabel="Create Client"
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={() => {
          navigate(appConfig.routes.clients)
        }}
      />
    </section>
  )
}