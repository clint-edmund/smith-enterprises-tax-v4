import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  UserRound,
} from "lucide-react"

import {
  formatClientNumber,
} from "@/features/clients/utils/client-formatters"
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

interface ReturnResultsCardsProps {
  taxReturns: TaxReturnListItem[]
}

export function ReturnResultsCards({
  taxReturns,
}: ReturnResultsCardsProps) {
  if (taxReturns.length === 0) {
    return (
      <div className="p-10 text-center lg:hidden">
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
    <div className="divide-y divide-slate-100 lg:hidden">
      {taxReturns.map(
        (taxReturn) => (
          <article
            key={taxReturn.id}
            className="space-y-4 p-5"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-slate-950">
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
              </div>

              <ReturnStatusBadge
                status={taxReturn.status}
              />
            </header>

            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 size-5 shrink-0 text-blue-700" />

              <div>
                <p className="font-semibold text-slate-900">
                  {taxReturn.taxYear}{" "}
                  {
                    taxFormLabels[
                      taxReturn.taxForm
                    ]
                  }
                </p>

                <p className="text-sm capitalize text-slate-500">
                  {taxReturn.returnType.replaceAll(
                    "_",
                    " ",
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 size-5 shrink-0 text-slate-400" />

              <div className="text-sm text-slate-700">
                <p>
                  Preparer:{" "}
                  {taxReturn.assignedPreparerName ??
                    "Unassigned"}
                </p>

                <p className="mt-1">
                  Reviewer:{" "}
                  {taxReturn.assignedReviewerName ??
                    "Unassigned"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-slate-400" />

              <div className="text-sm text-slate-700">
                <p>
                  Received:{" "}
                  {formatReturnDate(
                    taxReturn.dateReceived,
                  )}
                </p>

                <p className="mt-1">
                  Due:{" "}
                  {formatReturnDate(
                    taxReturn.dueDate,
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <CircleDollarSign className="size-5 text-emerald-700" />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Net fee
                </p>

                <p className="font-bold text-slate-950">
                  {formatReturnCurrency(
                    taxReturn.netFee,
                  )}
                </p>
              </div>
            </div>
          </article>
        ),
      )}
    </div>
  )
}