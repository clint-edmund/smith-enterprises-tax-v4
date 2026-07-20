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
}

type RiskFilter =
  | "all"
  | "critical"
  | "high"
  | "medium"
  | "low"

export function PriorityQueueCard({
  items,
}: PriorityQueueCardProps) {
  const [
  searchTerm,
  setSearchTerm,
] = useState("")

  const [
    riskFilter,
    setRiskFilter,
  ] = useState<RiskFilter>("all")

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

  const visibleItems =
    filteredItems.slice(0, 10)

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-slate-900 p-2 text-white dark:bg-slate-100 dark:text-slate-900">
            <ListChecks
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
              Priority Queue
            </h2>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Returns ordered by their current operational risk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {filteredItems.length}{" "}
            {filteredItems.length === 1
              ? "return"
              : "returns"}
          </span>

          <button
            type="button"
            disabled
            title="Full priority queue view will be added in a later phase."
            className={[
              "inline-flex items-center justify-center rounded-md",
              "border border-slate-200 bg-white px-3 py-2",
              "text-sm font-semibold text-slate-500",
              "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500",
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
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
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
                "rounded-full border px-3 py-1 text-sm font-medium transition",
                active
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
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

      {visibleItems.length > 0 ? (
        <div className="mt-6 space-y-4">
          {visibleItems.map((item) => (
            <PriorityQueueItem
              key={item.id}
              item={item}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-950">
          <ListChecks
            className="mx-auto h-8 w-8 text-slate-400"
            aria-hidden="true"
          />

          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
            No priority items
          </h3>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {searchTerm
              ? "No matching returns were found."
              : "No active returns currently require priority attention."}
          </p>
        </div>
      )}

      {filteredItems.length > visibleItems.length ? (
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Showing the first {visibleItems.length} of{" "}
          {filteredItems.length} prioritized returns.
        </p>
      ) : null}
    </section>
  )
}
