import {
  ArrowLeft,
  BadgePlus,
  ShieldCheck,
  UserPlus,
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
      <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-slate-50 px-5 py-5 sm:px-7">
          <Link
            to={appConfig.routes.clients}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />
            Back to Clients
          </Link>
        </div>

        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <UserPlus
                className="size-7"
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  New Client
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                  <BadgePlus
                    className="size-3.5"
                    aria-hidden="true"
                  />
                  New record
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Create a complete taxpayer client record for use across
                returns, assignments, communication, and future document
                workflows.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 lg:max-w-sm">
            <div className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Secure client setup
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-800">
                  Use approved secure workflows for SSNs, banking details,
                  payment information, and uploaded tax documents.
                </p>
              </div>
            </div>
          </div>
        </div>
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
