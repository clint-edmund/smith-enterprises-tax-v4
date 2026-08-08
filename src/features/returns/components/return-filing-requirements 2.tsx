import {
  Building2,
  Check,
  FileText,
  Landmark,
  X,
} from "lucide-react"

import type {
  TaxReturnDetails,
} from "@/features/returns/types/return.types"
import {
  formatReturnDate,
} from "@/features/returns/utils/return-formatters"

interface ReturnFilingRequirementsProps {
  taxReturn: TaxReturnDetails
}

interface RequirementItemProps {
  label: string
  required: boolean
  icon:
    typeof FileText
}

function RequirementItem({
  label,
  required,
  icon: Icon,
}: RequirementItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <Icon
          className="size-5 text-slate-500"
          aria-hidden="true"
        />

        <span className="font-medium text-slate-800">
          {label}
        </span>
      </div>

      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
          required
            ? "bg-emerald-100 text-emerald-800"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {required ? (
          <Check
            className="size-3.5"
            aria-hidden="true"
          />
        ) : (
          <X
            className="size-3.5"
            aria-hidden="true"
          />
        )}

        {required
          ? "Required"
          : "Not required"}
      </span>
    </div>
  )
}

export function ReturnFilingRequirements({
  taxReturn,
}: ReturnFilingRequirementsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-slate-950">
        Filing requirements
      </h2>

      <div className="mt-5 space-y-3">
        <RequirementItem
          label="Federal return"
          required={
            taxReturn.federalReturnRequired
          }
          icon={Landmark}
        />

        <RequirementItem
          label="State return"
          required={
            taxReturn.stateReturnRequired
          }
          icon={Building2}
        />

        <RequirementItem
          label="Local return"
          required={
            taxReturn.localReturnRequired
          }
          icon={FileText}
        />
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">
          Extension
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {taxReturn.extensionFiled
            ? `Filed on ${formatReturnDate(
                taxReturn.extensionDate,
              )}`
            : "No extension has been recorded."}
        </p>
      </div>
    </section>
  )
}