import {
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { Link } from "react-router-dom"

import {
  getReturnDetailsRoute,
} from "@/config/app-config"
import type {
  DashboardAttentionItem,
  DashboardAttentionReason,
} from "@/features/dashboard/types/dashboard.types"
import {
  formatDate,
  formatReturnStatus,
} from "@/features/dashboard/utils/dashboard-formatters"

interface DashboardAttentionListProps {
  items: DashboardAttentionItem[]
}

function getReasonLabel(
  reason: DashboardAttentionReason,
): string {
  const labels: Record<
    DashboardAttentionReason,
    string
  > = {
    overdue: "Overdue",
    due_soon: "Due soon",
    unassigned: "Unassigned",
    documents_pending: "Documents pending",
  }

  return labels[reason]
}

export function DashboardAttentionList({
  items,
}: DashboardAttentionListProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-white shadow-sm">
      <header className="border-b border-amber-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <AlertTriangle
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">
              Attention required
            </h2>

            <p className="text-sm text-slate-500">
              Returns that may need staff action
            </p>
          </div>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-medium text-slate-700">
            Nothing requires attention
          </p>

          <p className="mt-1 text-sm text-slate-500">
            No overdue, due-soon, unassigned, or document-pending returns were found.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li
              key={`${item.id}-${item.reason}`}
              className="px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    {getReasonLabel(item.reason)}
                  </span>

                  <p className="mt-2 truncate font-semibold text-slate-900">
                    {item.clientName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.taxYear}
                    {" · "}
                    {formatReturnStatus(item.status)}
                    {" · Due "}
                    {formatDate(item.dueDate)}
                  </p>
                </div>

                <Link
                  to={getReturnDetailsRoute(item.id)}
                  aria-label={`View ${item.clientName} return`}
                  className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  View
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
