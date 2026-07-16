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
  getReturnDetailsRoute,
} from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ReturnForm } from "@/features/returns/components/return-form"
import {
  getReturnClientOptions,
  getReturnServiceErrorMessage,
  getReturnStaffOptions,
  getTaxReturnById,
  updateTaxReturn,
} from "@/features/returns/services/return-service"
import type {
  ReturnClientOption,
  ReturnStaffOption,
  TaxReturnFormValues,
  TaxReturnRecord,
} from "@/features/returns/types/return.types"

const editRoles = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
]

function mapReturnToForm(
  taxReturn: TaxReturnRecord,
): TaxReturnFormValues {
  return {
    clientId: taxReturn.clientId,
    taxYear: taxReturn.taxYear,
    returnType: taxReturn.returnType,
    taxForm: taxReturn.taxForm,
    filingStatus: taxReturn.filingStatus,
    status: taxReturn.status,
    assignedPreparerId:
      taxReturn.assignedPreparerId ?? "",
    assignedReviewerId:
      taxReturn.assignedReviewerId ?? "",
    dateReceived:
      taxReturn.dateReceived ?? "",
    dueDate: taxReturn.dueDate ?? "",
    filedDate: taxReturn.filedDate ?? "",
    acceptedDate:
      taxReturn.acceptedDate ?? "",
    preparationFee:
      taxReturn.preparationFee,
    discountAmount:
      taxReturn.discountAmount,
    description:
      taxReturn.description ?? "",
    federalReturnRequired:
      taxReturn.federalReturnRequired,
    stateReturnRequired:
      taxReturn.stateReturnRequired,
    localReturnRequired:
      taxReturn.localReturnRequired,
    extensionFiled:
      taxReturn.extensionFiled,
    extensionDate:
      taxReturn.extensionDate ?? "",
    estimatedRefund:
      taxReturn.estimatedRefund,
    estimatedAmountDue:
      taxReturn.estimatedAmountDue,
    notes: taxReturn.notes ?? "",
  }
}

export function EditReturnPage() {
  const navigate = useNavigate()
  const { returnId } = useParams()
  const { profile } = useAuth()

  const [taxReturn, setTaxReturn] =
    useState<TaxReturnRecord | null>(null)

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

  useEffect(() => {
    let isMounted = true

    async function loadPage() {
      if (!returnId) {
        setErrorMessage(
          "The tax-return identifier is missing.",
        )
        setIsLoading(false)
        return
      }

      try {
        const [
          returnRecord,
          clientResults,
          staffResults,
        ] = await Promise.all([
          getTaxReturnById(returnId),
          getReturnClientOptions(),
          getReturnStaffOptions(),
        ])

        if (!isMounted) {
          return
        }

        if (!returnRecord) {
          setErrorMessage(
            "The tax return was not found.",
          )
          return
        }

        setTaxReturn(returnRecord)
        setClients(clientResults)
        setStaffOptions(staffResults)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          getReturnServiceErrorMessage(
            error,
          ),
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPage()

    return () => {
      isMounted = false
    }
  }, [returnId])

  if (
    !profile ||
    !editRoles.includes(profile.role)
  ) {
    return (
      <Navigate
        to={appConfig.routes.returns}
        replace
      />
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        Loading tax return...
      </div>
    )
  }

  if (!returnId || !taxReturn) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">
          Tax return unavailable
        </h1>

        <p className="mt-3 text-slate-600">
          {errorMessage ??
            "The tax return could not be loaded."}
        </p>

        <Link
          to={appConfig.routes.returns}
          className="mt-6 inline-flex font-semibold text-blue-700 hover:underline"
        >
          Return to Tax Returns
        </Link>
      </section>
    )
  }

  const currentReturn = taxReturn

  async function handleSubmit(
    values: TaxReturnFormValues,
  ) {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await updateTaxReturn(
        currentReturn.id,
        values,
      )

      navigate(
        getReturnDetailsRoute(
          currentReturn.id,
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
          to={getReturnDetailsRoute(
            currentReturn.id,
          )}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Back to Return
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">
          Edit Tax Return
        </h1>

        <p className="mt-2 text-slate-600">
          Update assignments, workflow status,
          dates, fees, and filing requirements.
        </p>
      </header>

      <ReturnForm
        mode="edit"
        clients={clients}
        staffOptions={staffOptions}
        defaultValues={mapReturnToForm(
          currentReturn,
        )}
        currentStatus={
          currentReturn.status
        }
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={() => {
          navigate(
            getReturnDetailsRoute(
              currentReturn.id,
            ),
          )
        }}
      />
    </section>
  )
}
