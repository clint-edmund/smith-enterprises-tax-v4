import type {
  LucideIcon,
} from "lucide-react"

interface PreferenceToggleProps {
  checked: boolean

  description: string

  disabled?: boolean

  icon?: LucideIcon

  label: string

  onChange: (
    checked: boolean,
  ) => void
}

export function PreferenceToggle({
  checked,
  description,
  disabled = false,
  icon: Icon,
  label,
  onChange,
}: PreferenceToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 gap-3">
        {Icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Icon
              aria-hidden="true"
              className="size-5"
            />
          </div>
        )}

        <div className="min-w-0">
          <p className="font-semibold text-slate-950">
            {label}
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>

      <button
        aria-checked={checked}
        aria-label={`${label}: ${
          checked
            ? "enabled"
            : "disabled"
        }`}
        className={[
          "relative mt-1 inline-flex h-6 w-11 shrink-0 rounded-full transition",
          "focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
          checked
            ? "bg-blue-600"
            : "bg-slate-300",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer",
        ].join(" ")}
        disabled={disabled}
        onClick={() => {
          onChange(!checked)
        }}
        role="switch"
        type="button"
      >
        <span
          className={[
            "pointer-events-none inline-block size-5 translate-y-0.5 rounded-full bg-white shadow transition",
            checked
              ? "translate-x-[22px]"
              : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    </div>
  )
}