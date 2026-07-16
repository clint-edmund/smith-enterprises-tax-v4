import {
  FilePlus2,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"
import {
  Link,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ReturnListSkeleton } from "@/features/returns/components/return-list-skeleton"
import { ReturnResultsCards } from "@/features/returns/components/return-results-cards"
import { ReturnResultsTable } from "@/features/returns/components/return-results-table"
import {
  getReturnStaffOptions,
  searchTaxReturns,
} from "@/features/returns/services/return-service"
import type {
  ReturnStaffOption,
  ReturnStatus,
  TaxReturnListItem,
} from "@/features/returns/types/return.types"
import {
  getTaxYearOptions,
  returnStatusOptions,
} from "@/features/returns/utils/return-options"
import {
  formatReturnCurrency,
} from "@/features/returns/utils/return-formatters"

type StatusFilter =
  | ReturnStatus
  | "all"

const createRoles = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
]

export function ReturnsPage() {
  const { profile } = useAuth()

  const [taxReturns, setTaxReturns] =
    useState<TaxReturnListItem[]>([])

  const [staffOptions, setStaffOptions] =
    useState<ReturnStaffOption[]>([])

  const [searchText, setSearchText] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all")

  const [taxYearFilter, setTaxYearFilter] =
    useState<string>("all")

  const [preparerFilter, setPreparerFilter] =
    useState<string>("all")

  const [isLoading, setIsLoading] =
    useState(true)

  const [isRefreshing, setIsRefreshing] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const taxYearOptions =
    useMemo(
      () => getTaxYearOptions(),
      [],
    )

  const canCreate =
    profile !== null &&
    createRoles.includes(profile.role)

  const loadTaxReturns =
    useCallback(
      async (
        options?: {
          search?: string
          status?: StatusFilter
          taxYear?: string
          preparerId?: string
          showRefreshing?: boolean
        },
      ) => {
        const activeSearch =
          options?.search ??
          searchText

        const activeStatus =
          options?.status ??
          statusFilter

        const activeTaxYear =
          options?.taxYear ??
          taxYearFilter

        const activePreparer =
          options?.preparerId ??
          preparerFilter

        if (options?.showRefreshing) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        setErrorMessage(null)

        try {
          const results =
            await searchTaxReturns(
              activeSearch,
              activeStatus,
              activeTaxYear === "all"
                ? null
                : Number(activeTaxYear),
              activePreparer === "all"
                ? null
                : activePreparer,
            )

          setTaxReturns(results)
        } catch (error) {
          console.error(
            "Unable to load tax returns:",
            error,
          )

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load tax returns.",
          )
        } finally {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      },
      [
        preparerFilter,
        searchText,
        statusFilter,
        taxYearFilter,
      ],
    )

  useEffect(() => {
    let isMounted = true

    async function initializePage() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const [
          staff,
          returns,
        ] = await Promise.all([
          getReturnStaffOptions(),

          searchTaxReturns(
            "",
            "all",
            null,
            null,
          ),
        ])

        if (!isMounted) {
          return
        }

        setStaffOptions(staff)
        setTaxReturns(returns)
      } catch (error) {
        if (!isMounted) {
          return
        }

        console.error(
          "Unable to initialize tax returns page:",
          error,
        )

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load tax returns.",
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void initializePage()

    return () => {
      isMounted = false
    }
  }, [])

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    void loadTaxReturns()
  }

  function handleStatusChange(
    nextStatus: StatusFilter,
  ) {
    setStatusFilter(nextStatus)

    void loadTaxReturns({
      status: nextStatus,
    })
  }

  function handleTaxYearChange(
    nextTaxYear: string,
  ) {
    setTaxYearFilter(nextTaxYear)

    void loadTaxReturns({
      taxYear: nextTaxYear,
    })
  }

  function handlePreparerChange(
    nextPreparerId: string,
  ) {
    setPreparerFilter(nextPreparerId)

    void loadTaxReturns({
      preparerId: nextPreparerId,
    })
  }

  function handleResetFilters() {
    setSearchText("")
    setStatusFilter("all")
    setTaxYearFilter("all")
    setPreparerFilter("all")

    void loadTaxReturns({
      search: "",
      status: "all",
      taxYear: "all",
      preparerId: "all",
    })
  }

  const resultNetFees =
    taxReturns.reduce(
      (
        total,
        taxReturn,
      ) =>
        total +
        taxReturn.netFee,
      0,
    )

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Return Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Tax Returns
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Search and review tax-return workflows,
            assignments, dates, and preparation fees.
          </p>
        </div>

        {canCreate && (
          <Link
            to={appConfig.routes.returnNew}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            <FilePlus2 className="size-5" />
            New Return
          </Link>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Results
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {taxReturns.length}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Result Net Fees
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {formatReturnCurrency(
              resultNetFees,
            )}
          </p>
        </article>
      </section>

      <form
        onSubmit={handleSearchSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 size-5 text-slate-400" />

          <input
            type="search"
            value={searchText}
            onChange={(event) => {
              setSearchText(
                event.target.value,
              )
            }}
            placeholder="Search client name, number, tax year, or form"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label
              htmlFor="return-status-filter"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Workflow status
            </label>

            <select
              id="return-status-filter"
              value={statusFilter}
              onChange={(event) => {
                handleStatusChange(
                  event.target
                    .value as StatusFilter,
                )
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">
                All statuses
              </option>

              {returnStatusOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="tax-year-filter"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Tax year
            </label>

            <select
              id="tax-year-filter"
              value={taxYearFilter}
              onChange={(event) => {
                handleTaxYearChange(
                  event.target.value,
                )
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">
                All years
              </option>

              {taxYearOptions.map(
                (taxYear) => (
                  <option
                    key={taxYear}
                    value={taxYear}
                  >
                    {taxYear}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="preparer-filter"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Assigned preparer
            </label>

            <select
              id="preparer-filter"
              value={preparerFilter}
              onChange={(event) => {
                handlePreparerChange(
                  event.target.value,
                )
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">
                All preparers
              </option>

              {staffOptions
                .filter(
                  (staff) =>
                    staff.role !==
                    "reviewer",
                )
                .map((staff) => (
                  <option
                    key={staff.id}
                    value={staff.id}
                  >
                    {staff.displayName}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800"
          >
            <Search className="size-4" />
            Search
          </button>

          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => {
              void loadTaxReturns({
                showRefreshing: true,
              })
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-700 bg-white px-4 py-2.5 font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
      </form>

      {errorMessage && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-900">
            Tax returns could not be loaded
          </p>

          <p className="mt-2 text-sm text-red-800">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => {
              void loadTaxReturns()
            }}
            className="mt-4 inline-flex items-center gap-2 font-semibold text-red-900"
          >
            <RefreshCw className="size-4" />
            Try Again
          </button>
        </section>
      )}

      {!errorMessage && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-950">
              Return Results
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing up to 250 matching records.
            </p>
          </header>

          {isLoading ? (
            <div className="p-5">
              <ReturnListSkeleton />
            </div>
          ) : (
            <>
              <ReturnResultsTable
                taxReturns={taxReturns}
              />

              <ReturnResultsCards
                taxReturns={taxReturns}
              />
            </>
          )}
        </section>
      )}
    </section>
  )
}