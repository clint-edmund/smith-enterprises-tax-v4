import type {
  ReactNode,
} from "react"

import {
  OrganizerFilterChips,
} from "./organizer-filter-chips"

import {
  OrganizerSearchBar,
} from "./organizer-search-bar"

import {
  OrganizerSortDropdown,
} from "./organizer-sort-dropdown"

interface OrganizerToolbarProps {
  searchValue: string

  searchPlaceholder?: string

  onSearchChange: (
    value: string,
  ) => void

  onSearchClear?: () => void

  resultCount?: number

  totalCount?: number

  filterKey: string

  filters: readonly {
    key: string
    label: string
    count?: number
  }[]

  onFilterChange: (
    key: string,
  ) => void

  sortKey: string

  sortOptions: readonly {
    key: string
    label: string
  }[]

  onSortChange: (
    key: string,
  ) => void

  actions?: ReactNode

  disabled?: boolean
}

export function OrganizerToolbar({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  onSearchClear,
  resultCount,
  totalCount,
  filterKey,
  filters,
  onFilterChange,
  sortKey,
  sortOptions,
  onSortChange,
  actions,
  disabled = false,
}: OrganizerToolbarProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-5">
          <OrganizerSearchBar
            value={searchValue}
            placeholder={searchPlaceholder}
            resultCount={resultCount}
            totalCount={totalCount}
            disabled={disabled}
            onChange={onSearchChange}
            onClear={onSearchClear}
          />

          <OrganizerFilterChips
            filters={filters}
            selectedKey={filterKey}
            disabled={disabled}
            onChange={onFilterChange}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <OrganizerSortDropdown
            value={sortKey}
            options={sortOptions}
            disabled={disabled}
            onChange={onSortChange}
          />

          {actions}
        </div>
      </div>
    </section>
  )
}