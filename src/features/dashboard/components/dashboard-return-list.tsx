import {
  ArrowRight,
  Clock3,
  FileText,
} from "lucide-react"
import { Link } from "react-router-dom"

import {
  getReturnDetailsRoute,
} from "@/config/app-config"
import type {
  DashboardReturnItem,
} from "@/features/dashboard/types/dashboard.types"
import {
  formatCurrency,
  formatDate,
  formatReturnStatus,
  formatReturnType,
} from "@/features/dashboard/utils/dashboard-formatters"

interface DashboardReturnListProps {
  returns: DashboardReturnItem[]
}

export function DashboardReturnList({
  returns,
}: DashboardReturnListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <FileText
              className="size-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">
              Recent returns
            </h2>

            <p className="text-sm text-slate-500">
              Most recently updated tax returns
            </p>
          </div>
        </div>
      </header>

      {returns.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-medium text-slate-700">
            No tax returns yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Recently updated returns will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {returns.map((taxReturn) => (
            <li
              key={taxReturn.id}
              className="px-5 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {taxReturn.clientName}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Client #{taxReturn.clientNumber}
                    {" · "}
                    {taxReturn.taxYear}
                    {" · "}
                    {formatReturnType(
                      taxReturn.returnType,
                    )}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      {formatReturnStatus(
                        taxReturn.status,
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      Due {formatDate(
                        taxReturn.dueDate,
                      )}
                    </span>

                    <span>
                      {formatCurrency(
                        taxReturn.netFee,
                      )}
                    </span>
                  </div>
                </div>

                <Link
                  to={getReturnDetailsRoute(
                    taxReturn.id,
                  )}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
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
