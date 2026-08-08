interface OrganizerDecisionCardProps {
  selected: boolean

  label: string

  description: string

  disabled?: boolean

  onSelect: () => void
}

export function OrganizerDecisionCard({
  selected,
  label,
  description,
  disabled = false,
  onSelect,
}: OrganizerDecisionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={[
        "w-full rounded-xl border p-4 text-left transition",
        selected
          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "",
      ].join(" ")}
    >
      <span className="block font-semibold text-slate-950">
        {label}
      </span>

      <span className="mt-1 block text-sm leading-6 text-slate-600">
        {description}
      </span>
    </button>
  )
}