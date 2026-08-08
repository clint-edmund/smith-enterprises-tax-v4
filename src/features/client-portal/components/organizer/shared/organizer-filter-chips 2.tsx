interface OrganizerFilterChip {
  key: string
  label: string
  count?: number
}

interface OrganizerFilterChipsProps {
  filters: readonly OrganizerFilterChip[]

  selectedKey: string

  disabled?: boolean

  onChange: (
    key: string,
  ) => void
}

export function OrganizerFilterChips({
  filters,
  selectedKey,
  disabled = false,
  onChange,
}: OrganizerFilterChipsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Filters"
    >
      {filters.map(
        (filter) => {
          const selected =
            filter.key ===
            selectedKey

          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={
                selected
              }
              disabled={
                disabled
              }
              onClick={() => {
                onChange(
                  filter.key,
                )
              }}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                selected
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "",
              ].join(" ")}
            >
              <span>
                {filter.label}
              </span>

              {filter.count !==
                undefined && (
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs",
                    selected
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  {
                    filter.count
                  }
                </span>
              )}
            </button>
          )
        },
      )}
    </div>
  )
}