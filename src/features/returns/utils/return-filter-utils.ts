import type {
  ReturnFilterKey,
  ReturnFilters,
  ReturnFilterUpdates,
  ReturnStatus,
} from "@/features/returns/types/return.types"

export const defaultReturnFilters: ReturnFilters = {
  search: "",
  status: "all",
  taxYear: "all",
  preparerId: "all",
}

const supportedReturnStatuses = [
  "not_started",
  "documents_pending",
  "in_progress",
  "ready_for_review",
  "under_review",
  "ready_to_file",
  "filed",
  "accepted",
  "rejected",
  "completed",
  "on_hold",
] as const satisfies readonly ReturnStatus[]

const supportedReturnStatusSet =
  new Set<string>(supportedReturnStatuses)

function normalizeSearch(
  value: string | null | undefined,
) {
  return value?.trim() ?? ""
}

function normalizeStatus(
  value: string | null | undefined,
): ReturnFilters["status"] {
  if (
    value !== null &&
    value !== undefined &&
    supportedReturnStatusSet.has(value)
  ) {
    return value as ReturnStatus
  }

  return "all"
}

function normalizeTaxYear(
  value: string | null | undefined,
) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "all"
  ) {
    return "all"
  }

  if (!/^\d{4}$/.test(value)) {
    return "all"
  }

  const year = Number(value)

  if (
    !Number.isInteger(year) ||
    year < 1900 ||
    year > 2100
  ) {
    return "all"
  }

  return String(year)
}

function normalizeIdentifier(
  value: string | null | undefined,
) {
  const normalizedValue =
    value?.trim() ?? ""

  return normalizedValue === ""
    ? "all"
    : normalizedValue
}

export function normalizeReturnFilters(
  filters: ReturnFilterUpdates,
): ReturnFilters {
  return {
    search: normalizeSearch(filters.search),
    status: normalizeStatus(filters.status),
    taxYear: normalizeTaxYear(filters.taxYear),
    preparerId: normalizeIdentifier(
      filters.preparerId,
    ),
  }
}

export function parseReturnFilters(
  searchParams: URLSearchParams,
): ReturnFilters {
  return normalizeReturnFilters({
    search: searchParams.get("search") ?? undefined,
    status: normalizeStatus(
      searchParams.get("status"),
    ),
    taxYear: searchParams.get("taxYear") ?? undefined,
    preparerId:
      searchParams.get("preparer") ?? undefined,
  })
}

export function buildReturnFilterSearchParams(
  filters: ReturnFilterUpdates,
) {
  const normalizedFilters =
    normalizeReturnFilters(filters)

  const searchParams =
    new URLSearchParams()

  if (normalizedFilters.search !== "") {
    searchParams.set(
      "search",
      normalizedFilters.search,
    )
  }

  if (normalizedFilters.status !== "all") {
    searchParams.set(
      "status",
      normalizedFilters.status,
    )
  }

  if (normalizedFilters.taxYear !== "all") {
    searchParams.set(
      "taxYear",
      normalizedFilters.taxYear,
    )
  }

  if (
    normalizedFilters.preparerId !== "all"
  ) {
    searchParams.set(
      "preparer",
      normalizedFilters.preparerId,
    )
  }

  return searchParams
}

export function buildReturnFilterQuery(
  filters: ReturnFilterUpdates,
) {
  const query =
    buildReturnFilterSearchParams(
      filters,
    ).toString()

  return query === ""
    ? ""
    : `?${query}`
}

export function mergeReturnFilters(
  currentFilters: ReturnFilters,
  updates: ReturnFilterUpdates,
): ReturnFilters {
  return normalizeReturnFilters({
    ...currentFilters,
    ...updates,
  })
}

export function removeReturnFilter(
  currentFilters: ReturnFilters,
  key: ReturnFilterKey,
): ReturnFilters {
  return mergeReturnFilters(
    currentFilters,
    {
      [key]: defaultReturnFilters[key],
    },
  )
}

export function clearReturnFilters(): ReturnFilters {
  return {
    ...defaultReturnFilters,
  }
}

export function isReturnFilterActive(
  filters: ReturnFilters,
  key: ReturnFilterKey,
) {
  return filters[key] !==
    defaultReturnFilters[key]
}

export function countActiveReturnFilters(
  filters: ReturnFilters,
) {
  const keys = Object.keys(
    defaultReturnFilters,
  ) as ReturnFilterKey[]

  return keys.reduce(
    (count, key) =>
      count +
      (isReturnFilterActive(
        filters,
        key,
      )
        ? 1
        : 0),
    0,
  )
}
