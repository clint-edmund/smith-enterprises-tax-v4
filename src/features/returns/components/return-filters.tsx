import {
  RotateCcw,
  Search,
  X,
} from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"

import type {
  ReturnFilterKey,
  ReturnFilters,
  ReturnStaffOption,
} from "@/features/returns/types/return.types"
import {
  returnStatusOptions,
} from "@/features/returns/utils/return-options"

interface ReturnFiltersProps {
  filters: ReturnFilters
  activeFilterCount: number
  staffOptions: ReturnStaffOption[]
  taxYearOptions: number[]
  onSetFilter: <Key extends ReturnFilterKey>(
    key: Key,
    value: ReturnFilters[Key],
  ) => void
  onRemoveFilter: (key: ReturnFilterKey) => void
  onClearFilters: () => void
}

function getStatusLabel(status: ReturnFilters["status"]) {
  if (status === "all") {
    return "All statuses"
  }

  return (
    returnStatusOptions.find(
      (option) => option.value === status,
    )?.label ?? status
  )
}

function getPreparerLabel(
  preparerId: string,
  staffOptions: ReturnStaffOption[],
) {
  return (
    staffOptions.find(
      (staff) => staff.id === preparerId,
    )?.displayName ?? "Selected preparer"
  )
}

export function ReturnFiltersPanel({
  filters,
  activeFilterCount,
  staffOptions,
  taxYearOptions,
  onSetFilter,
  onRemoveFilter,
  onClearFilters,
}: ReturnFiltersProps) {
  const [searchText, setSearchText] =
    useState(filters.search)

  useEffect(() => {
    setSearchText(filters.search)
  }, [filters.search])

  const preparerOptions = useMemo(
    () =>
      staffOptions.filter(
        (staff) => staff.role !== "reviewer",
      ),
    [staffOptions],
  )

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    onSetFilter("search", searchText)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 size-5 text-slate-400" />

        <input
          type="search"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value)
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
            value={filters.status}
            onChange={(event) => {
              onSetFilter(
                "status",
                event.target
                  .value as ReturnFilters["status"],
              )
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">
              All statuses
            </option>

            {returnStatusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
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
            value={filters.taxYear}
            onChange={(event) => {
              onSetFilter(
                "taxYear",
                event.target.value,
              )
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">
              All years
            </option>

            {taxYearOptions.map((taxYear) => (
              <option
                key={taxYear}
                value={taxYear}
              >
                {taxYear}
              </option>
            ))}
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
            value={filters.preparerId}
            onChange={(event) => {
              onSetFilter(
                "preparerId",
                event.target.value,
              )
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">
              All preparers
            </option>

            {preparerOptions.map((staff) => (
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

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
          <span className="text-sm font-semibold text-slate-700">
            Active filters ({activeFilterCount})
          </span>

          {filters.search !== "" && (
            <FilterChip
              label={`Search: ${filters.search}`}
              onRemove={() => {
                onRemoveFilter("search")
              }}
            />
          )}

          {filters.status !== "all" && (
            <FilterChip
              label={`Status: ${getStatusLabel(filters.status)}`}
              onRemove={() => {
                onRemoveFilter("status")
              }}
            />
          )}

          {filters.taxYear !== "all" && (
            <FilterChip
              label={`Tax year: ${filters.taxYear}`}
              onRemove={() => {
                onRemoveFilter("taxYear")
              }}
            />
          )}

          {filters.preparerId !== "all" && (
            <FilterChip
              label={`Preparer: ${getPreparerLabel(filters.preparerId, staffOptions)}`}
              onRemove={() => {
                onRemoveFilter("preparerId")
              }}
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={activeFilterCount === 0}
          onClick={onClearFilters}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="size-4" />
          Clear Filters
        </button>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800"
        >
          <Search className="size-4" />
          Search
        </button>
      </div>
    </form>
  )
}

interface FilterChipProps {
  label: string
  onRemove: () => void
}

function FilterChip({
  label,
  onRemove,
}: FilterChipProps) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800">
      <span className="truncate">
        {label}
      </span>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="rounded-full p-0.5 hover:bg-blue-100"
      >
        <X className="size-3.5" />
      </button>
    </span>
  )
}
