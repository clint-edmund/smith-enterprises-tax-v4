import type {
  LucideIcon,
} from "lucide-react"

interface QuickActionButtonProps {
  label: string
  description: string
  icon: LucideIcon
  tone:
    | "success"
    | "warning"
    | "danger"
  disabled?: boolean
  disabledReason?: string
  onClick: () => void
}

const toneClasses = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-950 hover:bg-emerald-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100",
  danger:
    "border-red-200 bg-red-50 text-red-950 hover:bg-red-100",
}

export function QuickActionButton({
  label,
  description,
  icon:
    Icon,
  tone,
  disabled = false,
  disabledReason,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      title={
        disabled
          ? disabledReason
          : undefined
      }
      className={[
        "flex min-h-28 w-full items-start gap-3 rounded-xl border p-4 text-left transition",
        toneClasses[
          tone
        ],
        disabled
          ? "cursor-not-allowed opacity-50"
          : "",
      ].join(" ")}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80">
        <Icon
          className="h-5 w-5"
          aria-hidden="true"
        />
      </span>

      <span>
        <span className="block font-semibold">
          {label}
        </span>

        <span className="mt-1 block text-sm leading-5 opacity-80">
          {disabled &&
          disabledReason
            ? disabledReason
            : description}
        </span>
      </span>
    </button>
  )
}
