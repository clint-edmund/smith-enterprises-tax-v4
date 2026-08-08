import {
  RefreshCw,
  Search,
  X,
} from "lucide-react"

import type {
  DocumentReviewPriorityCode,
} from "@/features/documents/types/review-queue.types"

export type ReviewQueueFilter =
  | "all"
  | DocumentReviewPriorityCode

interface ReviewQueueToolbarProps {
  searchTerm: string
  activeFilter: ReviewQueueFilter
  resultCount: number
  totalCount: number
  isRefreshing: boolean
  onSearchChange: (value: string) => void
  onFilterChange: (
    filter: ReviewQueueFilter,
  ) => void
  onRefresh: () => void
}

const filters: Array<{
  label: string
  value: ReviewQueueFilter
}> = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Overdue",
    value: "overdue",
  },
  {
    label: "Due Today",
    value: "due_today",
  },
  {
    label: "This Week",
    value: "due_this_week",
  },
  {
    label: "Upcoming",
    value: "upcoming",
  },
  {
    label: "No Due Date",
    value: "no_due_date",
  },
]

export function ReviewQueueToolbar({
  searchTerm,
  activeFilter,
  resultCount,
  totalCount,
  isRefreshing,
  onSearchChange,
  onFilterChange,
  onRefresh,
}: ReviewQueueToolbarProps) {
  const hasSearch =
    searchTerm.trim().length > 0

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              onSearchChange(event.target.value)
            }}
            placeholder="Search client or document..."
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            aria-label="Search review queue"
          />

          {hasSearch ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange("")
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Clear search"
            >
              <X
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              isRefreshing
                ? "animate-spin"
                : "",
            ].join(" ")}
            aria-hidden="true"
          />

          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive =
            activeFilter === filter.value

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                onFilterChange(filter.value)
              }}
              className={[
                "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
              aria-pressed={isActive}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {resultCount}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700">
          {totalCount}
        </span>{" "}
        assigned documents.
      </p>
    </div>
  )
}