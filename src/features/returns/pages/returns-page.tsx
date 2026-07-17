import {
  FilePlus2,
  RefreshCw,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Link,
} from "react-router-dom"

import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { ReturnFiltersPanel } from "@/features/returns/components/return-filters"
import { ReturnListSkeleton } from "@/features/returns/components/return-list-skeleton"
import { ReturnResultsCards } from "@/features/returns/components/return-results-cards"
import { ReturnResultsTable } from "@/features/returns/components/return-results-table"
import { useReturnFilters } from "@/features/returns/hooks/use-return-filters"
import {
  getReturnStaffOptions,
  searchTaxReturns,
} from "@/features/returns/services/return-service"
import type {
  ReturnStaffOption,
  TaxReturnListItem,
} from "@/features/returns/types/return.types"
import {
  formatReturnCurrency,
} from "@/features/returns/utils/return-formatters"
import {
  getTaxYearOptions,
} from "@/features/returns/utils/return-options"

const createRoles = [
  "administrator",
  "manager",
  "preparer",
  "reviewer",
  "receptionist",
]

function toLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function endOfCurrentWeek(date: Date) {
  const result = new Date(date)
  const daysUntilSunday = 7 - (result.getDay() || 7)
  result.setDate(result.getDate() + daysUntilSunday)
  return result
}

export function ReturnsPage() {
  const { profile } = useAuth()
  const {
    filters,
    activeFilterCount,
    hasActiveFilters,
    setFilter,
    removeFilter,
    clearFilters,
  } = useReturnFilters()

  const [allTaxReturns, setAllTaxReturns] =
    useState<TaxReturnListItem[]>([])

  const [staffOptions, setStaffOptions] =
    useState<ReturnStaffOption[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [isRefreshing, setIsRefreshing] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const taxYearOptions = useMemo(
    () => getTaxYearOptions(),
    [],
  )

  const canCreate =
    profile !== null &&
    createRoles.includes(profile.role)

  const loadTaxReturns = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setErrorMessage(null)

      try {
        const results = await searchTaxReturns(
          filters.search,
          filters.status,
          filters.taxYear === "all"
            ? null
            : Number(filters.taxYear),
          filters.preparerId === "all"
            ? null
            : filters.preparerId,
        )

        setAllTaxReturns(results)
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
    [filters],
  )

  useEffect(() => {
    let isMounted = true

    async function loadStaffOptions() {
      try {
        const staff =
          await getReturnStaffOptions()

        if (isMounted) {
          setStaffOptions(staff)
        }
      } catch (error) {
        console.error(
          "Unable to load return staff options:",
          error,
        )
      }
    }

    void loadStaffOptions()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    void loadTaxReturns()
  }, [loadTaxReturns])

  const taxReturns = useMemo(() => {
    const currentUserId = profile?.id ?? null
    const today = new Date()
    const todayKey = toLocalDateKey(today)
    const weekEndKey = toLocalDateKey(endOfCurrentWeek(today))
    const nextSevenDaysKey = toLocalDateKey(addDays(today, 7))

    return allTaxReturns.filter((taxReturn) => {
      if (
        filters.assignment === "mine" &&
        taxReturn.assignedPreparerId !== currentUserId
      ) {
        return false
      }

      if (
        filters.assignment === "unassigned" &&
        taxReturn.assignedPreparerId !== null
      ) {
        return false
      }

      if (
        filters.reviewer === "mine" &&
        taxReturn.assignedReviewerId !== currentUserId
      ) {
        return false
      }

      if (
        filters.reviewer === "unassigned" &&
        taxReturn.assignedReviewerId !== null
      ) {
        return false
      }

      if (filters.deadline === "all") {
        return true
      }

      if (filters.deadline === "no_due_date") {
        return taxReturn.dueDate === null
      }

      if (taxReturn.dueDate === null) {
        return false
      }

      if (filters.deadline === "overdue") {
        return taxReturn.dueDate < todayKey
      }

      if (filters.deadline === "due_today") {
        return taxReturn.dueDate === todayKey
      }

      if (filters.deadline === "due_this_week") {
        return (
          taxReturn.dueDate >= todayKey &&
          taxReturn.dueDate <= weekEndKey
        )
      }

      return (
        taxReturn.dueDate >= todayKey &&
        taxReturn.dueDate <= nextSevenDaysKey
      )
    })
  }, [
    allTaxReturns,
    filters.assignment,
    filters.deadline,
    filters.reviewer,
    profile?.id,
  ])

  const resultNetFees = taxReturns.reduce(
    (total, taxReturn) =>
      total + taxReturn.netFee,
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
            {formatReturnCurrency(resultNetFees)}
          </p>
        </article>
      </section>

      <ReturnFiltersPanel
        filters={filters}
        activeFilterCount={activeFilterCount}
        staffOptions={staffOptions}
        taxYearOptions={taxYearOptions}
        onSetFilter={setFilter}
        onRemoveFilter={removeFilter}
        onClearFilters={clearFilters}
      />

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isRefreshing}
          onClick={() => {
            void loadTaxReturns(true)
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-700 bg-white px-4 py-2.5 font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
          Refresh Results
        </button>
      </div>

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
              {hasActiveFilters
                ? `Showing up to 250 records matching ${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}.`
                : "Showing up to 250 matching records."}
            </p>
          </header>

          {isLoading ? (
            <div className="p-5">
              <ReturnListSkeleton />
            </div>
          ) : taxReturns.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-semibold text-slate-950">
                {hasActiveFilters
                  ? "No returns match your current filters."
                  : "No tax returns are available yet."}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {hasActiveFilters
                  ? "Remove one or more filters, or clear them all to view additional records."
                  : "Create a return to begin tracking tax-return work."}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => clearFilters()}
                  className="mt-4 font-semibold text-blue-700 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              )}
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
