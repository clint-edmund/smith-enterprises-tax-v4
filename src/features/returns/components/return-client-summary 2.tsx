import {
  Mail,
  Phone,
  UserRound,
} from "lucide-react"
import {
  Link,
} from "react-router-dom"

import {
  getClientDetailsRoute,
} from "@/config/app-config"
import type {
  TaxReturnDetails,
} from "@/features/returns/types/return.types"
import {
  formatClientName,
  formatClientNumber,
} from "@/features/clients/utils/client-formatters"

interface ReturnClientSummaryProps {
  taxReturn: TaxReturnDetails
}

export function ReturnClientSummary({
  taxReturn,
}: ReturnClientSummaryProps) {
  const clientName =
    formatClientName({
      firstName:
        taxReturn.clientFirstName,
      middleName:
        taxReturn.clientMiddleName,
      lastName:
        taxReturn.clientLastName,
      preferredName:
        taxReturn.clientPreferredName,
    })

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <UserRound
            className="size-5"
            aria-hidden="true"
          />
        </div>

        <div>
          <h2 className="font-bold text-slate-950">
            Client
          </h2>

          <p className="text-sm text-slate-500">
            Return owner
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Link
          to={getClientDetailsRoute(
            taxReturn.clientId,
          )}
          className="text-lg font-bold text-blue-700 hover:underline"
        >
          {clientName}
        </Link>

        <p className="mt-1 text-sm text-slate-500">
          {formatClientNumber(
            taxReturn.clientNumber,
          )}
        </p>
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
        <div className="flex gap-3 text-sm">
          <Mail
            className="mt-0.5 size-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />

          <span className="text-slate-700">
            {taxReturn.clientEmail ||
              "No email provided"}
          </span>
        </div>

        <div className="flex gap-3 text-sm">
          <Phone
            className="mt-0.5 size-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />

          <span className="text-slate-700">
            {taxReturn.clientPhone ||
              "No phone provided"}
          </span>
        </div>
      </div>
    </section>
  )
}