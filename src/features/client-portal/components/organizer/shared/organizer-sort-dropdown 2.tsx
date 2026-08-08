import {
  ArrowUpDown,
} from "lucide-react"

interface OrganizerSortOption {
  key: string
  label: string
}

interface OrganizerSortDropdownProps {
  value: string

  options: readonly OrganizerSortOption[]

  disabled?: boolean

  onChange: (
    value: string,
  ) => void
}

export function OrganizerSortDropdown({
  value,
  options,
  disabled = false,
  onChange,
}: OrganizerSortDropdownProps) {
  return (
    <label className="flex items-center gap-3">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <ArrowUpDown
          className="h-4 w-4"
          aria-hidden="true"
        />

        Sort
      </span>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(
            event.target.value,
          )
        }}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {options.map(
          (option) => (
            <option
              key={option.key}
              value={option.key}
            >
              {option.label}
            </option>
          ),
        )}
      </select>
    </label>
  )
}