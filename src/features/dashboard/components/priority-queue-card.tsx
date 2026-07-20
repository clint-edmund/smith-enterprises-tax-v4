import {
  ListChecks,
} from "lucide-react"

import {
  PriorityQueueItem,
} from "@/features/dashboard/components/priority-queue-item"
import type {
  DashboardPriorityItem,
} from "@/features/dashboard/types/dashboard.types"

type PriorityQueueCardProps = {
  items: DashboardPriorityItem[]
}

export function PriorityQueueCard({
  items,
}: PriorityQueueCardProps) {
  const visibleItems =
    items.slice(0, 10)

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
              Returns ordered by their current
              operational risk.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {items.length}{" "}
            {items.length === 1
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
            No active returns currently require
            priority attention.
          </p>
        </div>
      )}

      {items.length > visibleItems.length ? (
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          Showing the first {visibleItems.length} of{" "}
          {items.length} prioritized returns.
        </p>
      ) : null}
    </section>
  )
}