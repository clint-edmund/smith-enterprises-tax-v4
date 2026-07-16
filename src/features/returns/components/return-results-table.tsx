import {
  FileText,
} from "lucide-react"

import { ReturnStatusBadge } from "@/features/returns/components/return-status-badge"
import type {
  TaxReturnListItem,
} from "@/features/returns/types/return.types"
import {
  formatReturnClientName,
  formatReturnCurrency,
  formatReturnDate,
  taxFormLabels,
} from "@/features/returns/utils/return-formatters"
import {
  formatClientNumber,
} from "@/features/clients/utils/client-formatters"
import {
  Link,
} from "react-router-dom"

import {
  getReturnDetailsRoute,
} from "@/config/app-config"

interface ReturnResultsTableProps {
  taxReturns: TaxReturnListItem[]
}

export function ReturnResultsTable({
  taxReturns,
}: ReturnResultsTableProps) {
  if (taxReturns.length === 0) {
    return (
      <div className="p-10 text-center">
        <FileText className="mx-auto size-11 text-slate-400" />

        <h2 className="mt-4 font-bold text-slate-900">
          No tax returns found
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Adjust the search criteria or filters.
        </p>
      </div>
    )
  }

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Client
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Return
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Status
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Assignment
            </th>

            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              Dates
            </th>

            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
              Net Fee
            </th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {taxReturns.map(
            (taxReturn) => (
              <tr
                key={taxReturn.id}
                className="hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">
                    {formatReturnClientName(
                      taxReturn.clientFirstName,
                      taxReturn.clientLastName,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatClientNumber(
                      taxReturn.clientNumber,
                    )}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">
                    {taxReturn.taxYear}{" "}
                    {
                      taxFormLabels[
                        taxReturn.taxForm
                      ]
                    }
                  </p>

                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {taxReturn.returnType.replaceAll(
                      "_",
                      " ",
                    )}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <ReturnStatusBadge
                    status={taxReturn.status}
                  />
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  <p>
                    <span className="text-slate-500">
                      Preparer:
                    </span>{" "}
                    {taxReturn.assignedPreparerName ??
                      "Unassigned"}
                  </p>

                  <p className="mt-1">
                    <span className="text-slate-500">
                      Reviewer:
                    </span>{" "}
                    {taxReturn.assignedReviewerName ??
                      "Unassigned"}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  <p>
                    <span className="text-slate-500">
                      Received:
                    </span>{" "}
                    {formatReturnDate(
                      taxReturn.dateReceived,
                    )}
                  </p>

                  <p className="mt-1">
                    <span className="text-slate-500">
                      Due:
                    </span>{" "}
                    {formatReturnDate(
                      taxReturn.dueDate,
                    )}
                  </p>
                </td>

                <td className="px-5 py-4 text-right font-semibold text-slate-950">
                  {formatReturnCurrency(
                    taxReturn.netFee,
                  )}
              </td>

              <td className="px-5 py-4 text-right">
                <Link
                  to={getReturnDetailsRoute(
                    taxReturn.id,
                )}
                className="font-semibold text-blue-700 hover:underline"
                >
                  View
                </Link>
              </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  )
}