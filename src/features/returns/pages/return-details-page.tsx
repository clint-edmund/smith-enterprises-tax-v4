import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  FileText,
  UserRound,
} from "lucide-react"
import {
  useEffect,
  useState,
} from "react"
import {
  Link,
  useParams,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"
import { ReturnStatusBadge } from "@/features/returns/components/return-status-badge"
import { getTaxReturnById } from "@/features/returns/services/return-service"
import type {
  TaxReturnRecord,
} from "@/features/returns/types/return.types"
import {
  filingStatusLabels,
  formatReturnCurrency,
  formatReturnDate,
  returnTypeLabels,
  taxFormLabels,
} from "@/features/returns/utils/return-formatters"

export function ReturnDetailsPage() {
  const { returnId } = useParams()

  const [taxReturn, setTaxReturn] =
    useState<TaxReturnRecord | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadReturn() {
      if (!returnId) {
        setErrorMessage(
          "The tax-return identifier is missing.",
        )
        setIsLoading(false)
        return
      }

      try {
        const result =
          await getTaxReturnById(returnId)

        if (!result) {
          setErrorMessage(
            "The tax return was not found.",
          )
          return
        }

        setTaxReturn(result)
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the tax return.",
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadReturn()
  }, [returnId])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Loading tax return...
      </div>
    )
  }

  if (errorMessage || !taxReturn) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-slate-950">
          Tax return unavailable
        </h1>

        <p className="mt-3 text-slate-600">
          {errorMessage}
        </p>

        <Link
          to={appConfig.routes.returns}
          className="mt-6 inline-flex font-semibold text-blue-700"
        >
          Return to Tax Returns
        </Link>
      </section>
    )
  }

  const netFee =
    taxReturn.preparationFee -
    taxReturn.discountAmount

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

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              {taxReturn.taxYear}{" "}
              {
                taxFormLabels[
                  taxReturn.taxForm
                ]
              }
            </h1>

            <p className="mt-2 text-slate-600">
              {
                returnTypeLabels[
                  taxReturn.returnType
                ]
              }
            </p>
          </div>

          <ReturnStatusBadge
            status={taxReturn.status}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-blue-700" />

            <h2 className="font-bold text-slate-950">
              Return summary
            </h2>
          </div>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">
                Filing status
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {
                  filingStatusLabels[
                    taxReturn.filingStatus
                  ]
                }
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Description
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {taxReturn.description ||
                  "Not provided"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarDays className="size-5 text-blue-700" />

            <h2 className="font-bold text-slate-950">
              Important dates
            </h2>
          </div>

          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">
                Received
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {formatReturnDate(
                  taxReturn.dateReceived,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Due
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {formatReturnDate(
                  taxReturn.dueDate,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Filed
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {formatReturnDate(
                  taxReturn.filedDate,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-slate-500">
                Accepted
              </dt>

              <dd className="mt-1 font-semibold text-slate-950">
                {formatReturnDate(
                  taxReturn.acceptedDate,
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <UserRound className="size-5 text-blue-700" />

            <h2 className="font-bold text-slate-950">
              Assignments
            </h2>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Assigned staff names will be added to
            this page in Phase 8.4.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="size-5 text-blue-700" />

            <h2 className="font-bold text-slate-950">
              Fees
            </h2>
          </div>

          <dl className="mt-5 space-y-3">
            <div className="flex justify-between">
              <dt className="text-slate-600">
                Preparation fee
              </dt>

              <dd className="font-semibold text-slate-950">
                {formatReturnCurrency(
                  taxReturn.preparationFee,
                )}
              </dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-slate-600">
                Discount
              </dt>

              <dd className="font-semibold text-slate-950">
                {formatReturnCurrency(
                  taxReturn.discountAmount,
                )}
              </dd>
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-3">
              <dt className="font-semibold text-slate-950">
                Net fee
              </dt>

              <dd className="font-bold text-slate-950">
                {formatReturnCurrency(
                  netFee,
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
  )
}