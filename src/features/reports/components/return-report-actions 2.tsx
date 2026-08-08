import {
  Download,
  Printer,
} from "lucide-react"
import {
  useState,
} from "react"

import type {
  ReturnFilters,
  TaxReturnListItem,
} from "@/features/returns/types/return.types"
import {
  downloadReturnReportCsv,
  openPrintableReturnReport,
} from "@/features/reports/utils/return-report-utils"

interface ReturnReportActionsProps {
  filters: ReturnFilters
  taxReturns: TaxReturnListItem[]
}

export function ReturnReportActions({
  filters,
  taxReturns,
}: ReturnReportActionsProps) {
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const isDisabled = taxReturns.length === 0

  function handlePrint() {
    setErrorMessage(null)

    try {
      openPrintableReturnReport(taxReturns, filters)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The printable report could not be opened.",
      )
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => downloadReturnReportCsv(taxReturns)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" />
          Export CSV
        </button>

        <button
          type="button"
          disabled={isDisabled}
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Printer className="size-4" />
          Print Report
        </button>
      </div>

      {errorMessage && (
        <p className="text-right text-sm font-medium text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
