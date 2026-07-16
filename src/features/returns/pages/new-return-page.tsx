import {
  ArrowLeft,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Link,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom"

import {
  appConfig,
  getReturnDetailsRoute,
} from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ReturnForm } from "@/features/returns/components/return-form"
import {
  createTaxReturn,
  getReturnClientOptions,
  getReturnServiceErrorMessage,
  getReturnStaffOptions,
} from "@/features/returns/services/return-service"
import type {
  ReturnClientOption,
  ReturnStaffOption,
  TaxReturnFormValues,
} from "@/features/returns/types/return.types"

const createRoles = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
]

export function NewReturnPage() {
  const navigate = useNavigate()

  const [searchParams] =
    useSearchParams()

  const { profile } = useAuth()

  const [clients, setClients] =
    useState<ReturnClientOption[]>([])

  const [staffOptions, setStaffOptions] =
    useState<ReturnStaffOption[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const requestedClientId =
    searchParams.get("clientId") ?? ""

  const currentTaxYear =
    new Date().getFullYear() - 1

  const defaultValues =
    useMemo<TaxReturnFormValues>(
      () => ({
        clientId: requestedClientId,
        taxYear: currentTaxYear,
        returnType: "individual",
        taxForm: "1040",
        filingStatus: "single",
        status: "not_started",
        assignedPreparerId:
          profile?.role === "preparer"
            ? profile.id
            : "",
        assignedReviewerId: "",
        dateReceived: "",
        dueDate: "",
        filedDate: "",
        acceptedDate: "",
        preparationFee: 0,
        discountAmount: 0,
        description: "",
        federalReturnRequired: true,
        stateReturnRequired: false,
        localReturnRequired: false,
        extensionFiled: false,
        extensionDate: "",
        estimatedRefund: 0,
        estimatedAmountDue: 0,
        notes: "",
      }),
      [
        currentTaxYear,
        profile,
        requestedClientId,
      ],
    )

  useEffect(() => {
    let isMounted = true

    async function loadOptions() {
      try {
        const [
          clientResults,
          staffResults,
        ] = await Promise.all([
          getReturnClientOptions(),
          getReturnStaffOptions(),
        ])

        if (!isMounted) {
          return
        }

        setClients(clientResults)
        setStaffOptions(staffResults)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load return options.",
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOptions()

    return () => {
      isMounted = false
    }
  }, [])

  if (
    !profile ||
    !createRoles.includes(profile.role)
  ) {
    return (
      <Navigate
        to={appConfig.routes.returns}
        replace
      />
    )
  }

  async function handleSubmit(
    values: TaxReturnFormValues,
  ) {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const taxReturn =
        await createTaxReturn(values)

      navigate(
        getReturnDetailsRoute(
          taxReturn.id,
        ),
        {
          replace: true,
        },
      )
    } catch (error) {
      setErrorMessage(
        getReturnServiceErrorMessage(
          error,
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <Link
          to={appConfig.routes.returns}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to Tax Returns
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
          New Tax Return
        </h1>

        <p className="mt-2 text-slate-600">
          Create a tax-return workflow for an
          existing client.
        </p>
      </header>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          Loading return options...
        </div>
      ) : clients.length === 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <h2 className="text-xl font-bold text-amber-950">
            An active client is required
          </h2>

          <p className="mt-2 text-amber-900">
            Create or activate a client before
            starting a tax return.
          </p>

          <Link
            to={appConfig.routes.clientNew}
            className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Create Client
          </Link>
        </section>
      ) : (
        <ReturnForm
          mode="create"
          clients={clients}
          staffOptions={staffOptions}
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
          onCancel={() => {
            navigate(
              appConfig.routes.returns,
            )
          }}
        />
      )}
    </section>
  )
}