export interface OrganizerSearchOptions {
  search?: string
}

export interface OrganizerSortOption {
  field: string

  direction:
    "asc" |
    "desc"
}

export interface OrganizerListState<T> {
  records: T[]

  filteredRecords: T[]

  search: string
}

export interface OrganizerCrudResult<T> {
  success: boolean

  record?: T

  errorMessage?: string
}

export interface OrganizerDeleteResult {
  success: boolean

  errorMessage?: string
}