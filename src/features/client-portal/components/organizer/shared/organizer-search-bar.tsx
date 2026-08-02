import {
  Search,
  X,
} from "lucide-react"

interface OrganizerSearchBarProps {
  value: string

  placeholder?: string

  resultCount?: number

  totalCount?: number

  disabled?: boolean

  onChange: (
    value: string,
  ) => void

  onClear?: () => void
}

export function OrganizerSearchBar({
  value,
  placeholder =
    "Search...",
  resultCount,
  totalCount,
  disabled = false,
  onChange,
  onClear,
}: OrganizerSearchBarProps) {
  const showCount =
    resultCount !== undefined &&
    totalCount !== undefined

  function handleClear() {
    onChange("")
    onClear?.()
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />

        <input
          type="search"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => {
            onChange(
              event.target.value,
            )
          }}
          className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-12 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        {value && (
          <button
            type="button"
            disabled={disabled}
            onClick={
              handleClear
            }
            className="absolute right-3 top-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Clear search"
          >
            <X
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {showCount && (
        <p
          className="text-xs text-slate-500"
          aria-live="polite"
        >
          Showing{" "}
          <span className="font-medium text-slate-700">
            {resultCount}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-700">
            {totalCount}
          </span>{" "}
          records
        </p>
      )}
    </div>
  )
}