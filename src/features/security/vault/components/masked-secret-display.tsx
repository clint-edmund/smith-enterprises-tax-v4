import {
  LockKeyhole,
  RefreshCw,
} from "lucide-react"

import {
  VaultStatusBadge,
  type VaultSecretStatus,
} from "./vault-status-badge"

interface MaskedSecretDisplayProps {
  label: string
  maskedValue: string
  status: VaultSecretStatus

  updatedAt?: string | null
  disabled?: boolean

  onReplace?: () => void
}

function formatUpdatedAt(
  value?: string | null,
): string | null {
  if (!value) {
    return null
  }

  const parsedDate =
    new Date(value)

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return null
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(parsedDate)
}

export function MaskedSecretDisplay({
  label,
  maskedValue,
  status,
  updatedAt,
  disabled = false,
  onReplace,
}: MaskedSecretDisplayProps) {
  const formattedUpdatedAt =
    formatUpdatedAt(updatedAt)

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LockKeyhole
              className="h-4 w-4 text-slate-500"
              aria-hidden="true"
            />

            <p className="text-sm font-semibold text-slate-700">
              {label}
            </p>
          </div>

          <p className="mt-3 font-mono text-lg font-bold tracking-wider text-slate-950">
            {maskedValue}
          </p>

          {formattedUpdatedAt && (
            <p className="mt-2 text-xs text-slate-500">
              Last updated{" "}
              {formattedUpdatedAt}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <VaultStatusBadge
            status={status}
          />

          {onReplace && (
            <button
              type="button"
              disabled={disabled}
              onClick={onReplace}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className="h-4 w-4"
                aria-hidden="true"
              />

              Replace
            </button>
          )}
        </div>
      </div>
    </div>
  )
}