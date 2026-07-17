import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  FileText,
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
  getReturnEditRoute,
} from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { DocumentWorkspace } from "@/features/documents/components/document-workspace"
import { ReturnActivityTimeline } from "@/features/returns/components/return-activity-timeline"
import { ReturnAssignmentSummary } from "@/features/returns/components/return-assignment-summary"
import { ReturnClientSummary } from "@/features/returns/components/return-client-summary"
import { ReturnFilingRequirements } from "@/features/returns/components/return-filing-requirements"
import { ReturnFinancialSummary } from "@/features/returns/components/return-financial-summary"
import { ReturnStatusBadge } from "@/features/returns/components/return-status-badge"
import { ReturnWorkflowProgress } from "@/features/returns/components/return-workflow-progress"
import { getTaxReturnDetailData } from "@/features/returns/services/return-service"
import type {
  TaxReturnDetailData,
} from "@/features/returns/types/return.types"
import {
  filingStatusLabels,
  formatReturnDate,
  formatReturnDateTime,
  returnTypeLabels,
  taxFormLabels,
} from "@/features/returns/utils/return-formatters"

import {
  ReturnWorkflowPanel,
} from "@/features/workflow"

const editRoles = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
]

export function ReturnDetailsPage() {
  const { returnId } = useParams()
  const { profile } = useAuth()

  const [
    detailData,
    setDetailData,
  ] = useState<TaxReturnDetailData | null>(
    null,
  )

  const [isLoading, setIsLoading] =
    useState(true)

  const [isRefreshing, setIsRefreshing] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const loadReturn =
    useCallback(
      async (
        showRefreshing = false,
      ) => {
        if (!returnId) {
          setErrorMessage(
            "The tax-return identifier is missing.",
          )
          setIsLoading(false)
          return
        }

        if (showRefreshing) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        setErrorMessage(null)

        try {
          const result =
            await getTaxReturnDetailData(
              returnId,
            )

          if (!result) {
            setErrorMessage(
              "The tax return was not found.",
            )
            setDetailData(null)
            return
          }

          setDetailData(result)
        } catch (error) {
          console.error(
            "Unable to load tax return:",
            error,
          )

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load the tax return.",
          )
        } finally {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      },
      [returnId],
    )

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadReturn()
      }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadReturn])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    )
  }

  if (
    errorMessage ||
    !detailData
  ) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">
          Tax return unavailable
        </h1>

        <p className="mt-3 text-slate-600">
          {errorMessage ??
            "The return could not be loaded."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void loadReturn()
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800"
          >
            <RefreshCw className="size-4" />
            Try Again
          </button>

          <Link
            to={appConfig.routes.returns}
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Return to Tax Returns
          </Link>
        </div>
      </section>
    )
  }

  const {
    taxReturn,
    activities,
  } = detailData

  const canEdit =
    profile !== null &&
    editRoles.includes(profile.role)

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              to={appConfig.routes.returns}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200"
            >
              <ArrowLeft className="size-4" />
              Back to Tax Returns
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {taxReturn.taxYear}{" "}
                {
                  taxFormLabels[
                    taxReturn.taxForm
                  ]
                }
              </h1>

              <ReturnStatusBadge
                status={taxReturn.status}
              />
            </div>

            <p className="mt-3 text-slate-300">
              {
                returnTypeLabels[
                  taxReturn.returnType
                ]
              }
              {" · "}
              {
                filingStatusLabels[
                  taxReturn.filingStatus
                ]
              }
            </p>

            {taxReturn.description && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                {taxReturn.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={() => {
                void loadReturn(true)
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                className={`size-4 ${
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>

            {canEdit && (
              <Link
                to={getReturnEditRoute(
                  taxReturn.id,
                )}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500"
              >
                <Edit3 className="size-4" />
                Edit Return
              </Link>
            )}
          </div>
        </div>
      </header>

      {canEdit && (
        <ReturnWorkflowPanel
          returnId={taxReturn.id}
          workflowStatus={
            taxReturn.workflowStatus
          }
          holdReason={
            taxReturn.workflowHoldReason
          }
          statusChangedAt={
            taxReturn.workflowStatusChangedAt
          }
          onWorkflowUpdated={() => {
            void loadReturn(true)
          }}
        />
      )}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <ReturnClientSummary
            taxReturn={taxReturn}
          />

          <ReturnAssignmentSummary
            taxReturn={taxReturn}
          />

          <ReturnFilingRequirements
            taxReturn={taxReturn}
          />
        </div>

        <ReturnWorkflowProgress
          status={taxReturn.status}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarDays
              className="size-5 text-blue-700"
              aria-hidden="true"
            />

            <h2 className="font-bold text-slate-950">
              Important dates
            </h2>
          </div>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">
                Date received
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {formatReturnDate(
                  taxReturn.dateReceived,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Due date
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {formatReturnDate(
                  taxReturn.dueDate,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Filed date
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {formatReturnDate(
                  taxReturn.filedDate,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Accepted date
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {formatReturnDate(
                  taxReturn.acceptedDate,
                )}
              </dd>
            </div>
          </dl>
        </section>

        <ReturnFinancialSummary
          taxReturn={taxReturn}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <FileText
            className="size-5 text-blue-700"
            aria-hidden="true"
          />

          <h2 className="font-bold text-slate-950">
            Internal notes
          </h2>
        </div>

        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {taxReturn.notes ||
            "No internal notes have been recorded."}
        </p>
      </section>

      <DocumentWorkspace
        clientId={taxReturn.clientId}
        taxReturnId={taxReturn.id}
        title="Return Documents"
      />

      <ReturnActivityTimeline
        activities={activities}
      />

      <footer className="flex flex-col gap-1 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <p>
          Created:{" "}
          {formatReturnDateTime(
            taxReturn.createdAt,
          )}
        </p>

        <p>
          Last updated:{" "}
          {formatReturnDateTime(
            taxReturn.updatedAt,
          )}
        </p>
      </footer>
    </section>
  )
}