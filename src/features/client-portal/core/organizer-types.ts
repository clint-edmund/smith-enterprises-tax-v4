export interface OrganizerSearchOptions {
  search: string
}

export interface OrganizerSortOptions<
  TField extends string = string,
> {
  field: TField

  direction:
    | "asc"
    | "desc"
}

export interface OrganizerFilterOptions {
  statuses?: readonly string[]

  documentReceived?: boolean

  tags?: readonly string[]
}

export interface OrganizerPagedResult<T> {
  records: T[]

  totalCount: number
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

export interface OrganizerValidationError {
  field: string

  message: string
}