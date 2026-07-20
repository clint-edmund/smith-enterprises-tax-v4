import {
  useCallback,
  useMemo,
} from "react"
import {
  useSearchParams,
} from "react-router-dom"

import type {
  ReturnFilterKey,
  ReturnFilterNavigationOptions,
  ReturnFilters,
  ReturnFilterUpdates,
} from "@/features/returns/types/return.types"
import {
  buildReturnFilterSearchParams,
  clearReturnFilters,
  countActiveReturnFilters,
  mergeReturnFilters,
  parseReturnFilters,
  removeReturnFilter,
} from "@/features/returns/utils/return-filter-utils"

export interface UseReturnFiltersResult {
  filters: ReturnFilters
  activeFilterCount: number
  hasActiveFilters: boolean
  setFilter: <Key extends ReturnFilterKey>(
    key: Key,
    value: ReturnFilters[Key],
    options?: ReturnFilterNavigationOptions,
  ) => void
  updateFilters: (
    updates: ReturnFilterUpdates,
    options?: ReturnFilterNavigationOptions,
  ) => void
  removeFilter: (
    key: ReturnFilterKey,
    options?: ReturnFilterNavigationOptions,
  ) => void
  clearFilters: (
    options?: ReturnFilterNavigationOptions,
  ) => void
}

export function useReturnFilters(): UseReturnFiltersResult {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()

  const filters = useMemo(
    () => parseReturnFilters(searchParams),
    [searchParams],
  )

  const navigateToFilters = useCallback(
    (
      nextFilters: ReturnFilters,
      options?: ReturnFilterNavigationOptions,
    ) => {
      setSearchParams(
        buildReturnFilterSearchParams(
          nextFilters,
        ),
        {
          replace: options?.replace ?? false,
        },
      )
    },
    [setSearchParams],
  )

  const updateFilters = useCallback(
    (
      updates: ReturnFilterUpdates,
      options?: ReturnFilterNavigationOptions,
    ) => {
      navigateToFilters(
        mergeReturnFilters(
          filters,
          updates,
        ),
        options,
      )
    },
    [filters, navigateToFilters],
  )

  const setFilter = useCallback(
    <Key extends ReturnFilterKey>(
      key: Key,
      value: ReturnFilters[Key],
      options?: ReturnFilterNavigationOptions,
    ) => {
      updateFilters(
        {
          [key]: value,
        },
        options,
      )
    },
    [updateFilters],
  )

  const removeFilter = useCallback(
    (
      key: ReturnFilterKey,
      options?: ReturnFilterNavigationOptions,
    ) => {
      navigateToFilters(
        removeReturnFilter(
          filters,
          key,
        ),
        options,
      )
    },
    [filters, navigateToFilters],
  )

  const resetFilters = useCallback(
    (
      options?: ReturnFilterNavigationOptions,
    ) => {
      navigateToFilters(
        clearReturnFilters(),
        options,
      )
    },
    [navigateToFilters],
  )

  const activeFilterCount = useMemo(
    () => countActiveReturnFilters(filters),
    [filters],
  )

  return {
    filters,
    activeFilterCount,
    hasActiveFilters:
      activeFilterCount > 0,
    setFilter,
    updateFilters,
    removeFilter,
    clearFilters: resetFilters,
  }
}
