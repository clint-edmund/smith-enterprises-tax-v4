import {
  Archive,
  CheckCircle2,
  Clock3,
  RefreshCw,
  XCircle,
} from "lucide-react"

export type VaultSecretStatus =
  | "collected"
  | "pending_verification"
  | "verified"
  | "rejected"
  | "replaced"
  | "archived"

interface VaultStatusBadgeProps {
  status: VaultSecretStatus
}

const statusDetails: Record<
  VaultSecretStatus,
  {
    label: string
    className: string
  }
> = {
  collected: {
    label: "Collected",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  pending_verification: {
    label: "Pending Verification",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  verified: {
    label: "Verified",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  rejected: {
    label: "Needs Correction",
    className:
      "border-red-200 bg-red-50 text-red-700",
  },

  replaced: {
    label: "Replaced",
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
  },

  archived: {
    label: "Archived",
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
  },
}

export function VaultStatusBadge({
  status,
}: VaultStatusBadgeProps) {
  const details =
    statusDetails[status]

  const Icon =
    status === "verified"
      ? CheckCircle2
      : status === "rejected"
        ? XCircle
        : status === "replaced"
          ? RefreshCw
          : status === "archived"
            ? Archive
            : Clock3

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        details.className,
      ].join(" ")}
    >
      <Icon
        className="h-3.5 w-3.5"
        aria-hidden="true"
      />

      {details.label}
    </span>
  )
}