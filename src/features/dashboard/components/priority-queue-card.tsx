import {
  ListChecks,
  Search,
} from "lucide-react"

import {
  useMemo,
  useState,
} from "react"

import {
  PriorityQueueItem,
} from "@/features/dashboard/components/priority-queue-item"
import type {
  DashboardPriorityItem,
} from "@/features/dashboard/types/dashboard.types"

type PriorityQueueCardProps = {
  items: DashboardPriorityItem[]
  onPriorityItemUpdated: () => void
}

type RiskFilter =
  | "all"
  | "critical"
  | "high"
  | "medium"
  | "low"

type SortOption =
  | "highest-risk"
  | "lowest-risk"
  | "due-date"
  | "client-name"
  | "readiness"

export function PriorityQueueCard({
  items,
  onPriorityItemUpdated,
}: PriorityQueueCardProps) {
  const [
  searchTerm,
  setSearchTerm,
] = useState("")

  const [
    riskFilter,
    setRiskFilter,
  ] = useState<RiskFilter>("all")

  const [
    sortOption,
    setSortOption,
  ] = useState<SortOption>(
    "highest-risk",
  )

  const filteredItems = useMemo(() => {
  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase()

  return items.filter((item) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      item.clientName
        .toLowerCase()
        .includes(normalizedSearch)

    const matchesRisk =
      riskFilter === "all" ||
      item.riskLevel === riskFilter

    return (
      matchesSearch &&
      matchesRisk
    )
  })
}, [
  items,
  searchTerm,
  riskFilter,
])

  const sortedItems = useMemo(() => {
  const results = [...filteredItems]

  switch (sortOption) {
    case "lowest-risk":
      results.sort(
        (a, b) =>
          a.riskScore - b.riskScore,
      )
      break

    case "due-date":
      results.sort((a, b) => {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1

        return (
          new Date(a.dueDate).getTime() -
          new Date(b.dueDate).getTime()
        )
      })
      break

    case "client-name":
      results.sort((a, b) =>
        a.clientName.localeCompare(
          b.clientName,
        ),
      )
      break

    case "readiness":
      results.sort(
        (a, b) =>
          b.readinessScore -
          a.readinessScore,
      )
      break

    default:
      results.sort(
        (a, b) =>
          b.riskScore - a.riskScore,
      )
  }

  return results
}, [
  filteredItems,
  sortOption,
])

const riskSummary = useMemo(() => {
  const normalizedSearch =
    searchTerm.trim().toLowerCase()

  const searchResults = items.filter((item) =>
    normalizedSearch.length === 0
      ? true
      : item.clientName
          .toLowerCase()
          .includes(normalizedSearch),
  )

  return {
    critical: searchResults.filter(
      (item) => item.riskLevel === "critical",
    ).length,

    high: searchResults.filter(
      (item) => item.riskLevel === "high",
    ).length,

    medium: searchResults.filter(
      (item) => item.riskLevel === "medium",
    ).length,

    low: searchResults.filter(
      (item) => item.riskLevel === "low",
    ).length,
  }
}, [
  items,
  searchTerm,
])

const visibleItems =
  sortedItems.slice(0, 10)

  return (
    <section className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.55)] dark:border-stone-800 dark:bg-stone-950/50 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-stone-700 bg-stone-900 p-2.5 text-white shadow-sm dark:border-stone-300 dark:bg-stone-100 dark:text-stone-900">
            <ListChecks
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
              Priority Queue
            </h2>

            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Returns ordered by their current operational risk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm font-semibold text-stone-700 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
            {filteredItems.length}{" "}
            {filteredItems.length === 1
              ? "return"
              : "returns"}
          </span>

          <select
            value={sortOption}
            onChange={(event) =>
              setSortOption(
                event.target.value as SortOption,
              )
            }
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:focus:border-stone-500 dark:focus:ring-stone-800"
          >
            <option value="highest-risk">
              Highest Risk
            </option>

            <option value="lowest-risk">
              Lowest Risk
            </option>

            <option value="due-date">
              Due Date
            </option>

            <option value="client-name">
              Client Name
            </option>

            <option value="readiness">
              Readiness Score
            </option>
          </select>

          <button
            type="button"
            disabled
            title="Full priority queue view will be added in a later phase."
            className={[
              "inline-flex items-center justify-center rounded-md",
              "border border-stone-200 bg-white px-3 py-2",
              "text-sm font-semibold text-stone-500",
              "dark:border-stone-800 dark:bg-stone-900 dark:text-stone-500",
              "cursor-not-allowed opacity-70",
            ].join(" ")}
          >
            View All
          </button>
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="priority-search"
          className="sr-only"
        >
          Search priority queue
        </label>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />

          <input
            id="priority-search"
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search by client name..."
            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-2 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-500 dark:focus:ring-stone-800"
          />
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "all",
          "critical",
          "high",
          "medium",
          "low",
        ].map((filter) => {
          const active =
            riskFilter === filter

          return (
            <button
              key={filter}
              type="button"
              onClick={() =>
                setRiskFilter(
                  filter as RiskFilter,
                )
              }
              className={[
                "rounded-full border px-3 py-1.5 text-sm font-semibold transition duration-200",
                active
                  ? "border-stone-900 bg-stone-900 text-white shadow-sm dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800",
              ].join(" ")}
            >
              {filter === "all"
                ? "All Risks"
                : filter.charAt(0).toUpperCase() +
                  filter.slice(1)}
            </button>
          )
        })}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 shadow-sm dark:border-red-900/60 dark:bg-red-950/30">
          <p className="text-xs font-semibold uppercase text-red-700 dark:text-red-300">
            Critical
          </p>

          <p className="mt-1 text-xl font-bold text-red-900 dark:text-red-200">
            {riskSummary.critical}
          </p>
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-3 shadow-sm dark:border-orange-900/60 dark:bg-orange-950/30">
          <p className="text-xs font-semibold uppercase text-orange-700 dark:text-orange-300">
            High
          </p>

          <p className="mt-1 text-xl font-bold text-orange-900 dark:text-orange-200">
            {riskSummary.high}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">
            Medium
          </p>

          <p className="mt-1 text-xl font-bold text-amber-900 dark:text-amber-200">
            {riskSummary.medium}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
            Low
          </p>

          <p className="mt-1 text-xl font-bold text-emerald-900 dark:text-emerald-200">
            {riskSummary.low}
          </p>
        </div>
      </div>  

      {visibleItems.length > 0 ? (
        <div className="mt-6 space-y-4">
          {visibleItems.map((item) => (
            <PriorityQueueItem
            key={item.id}
            item={item}
            onPriorityItemUpdated={
              onPriorityItemUpdated
            }
          />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center shadow-inner dark:border-stone-700 dark:bg-stone-950">
          <ListChecks
            className="mx-auto h-8 w-8 text-stone-400"
            aria-hidden="true"
          />

          <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-stone-100">
            No priority items
          </h3>

          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {searchTerm
              ? "No matching returns were found."
              : "No active returns currently require priority attention."}
          </p>
        </div>
      )}

      {filteredItems.length > visibleItems.length ? (
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-stone-400">
          Showing the first {visibleItems.length} of{" "}
          {filteredItems.length} prioritized returns.
        </p>
      ) : null}
    </section>
  )
}
