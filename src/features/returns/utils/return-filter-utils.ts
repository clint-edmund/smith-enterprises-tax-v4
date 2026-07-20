import type {
  ReturnAssignmentFilter,
  ReturnDeadlineFilter,
  ReturnFilterKey,
  ReturnFilters,
  ReturnFilterUpdates,
  ReturnReviewerFilter,
  ReturnStatus,
} from "@/features/returns/types/return.types"

export const defaultReturnFilters: ReturnFilters = {
  search: "",
  status: "all",
  workflow: "all",
  taxYear: "all",
  preparerId: "all",
  assignment: "all",
  reviewer: "all",
  deadline: "all",
}

const statuses = new Set<string>([
  "not_started", "documents_pending", "in_progress", "ready_for_review",
  "under_review", "ready_to_file", "filed", "accepted", "rejected",
  "completed", "on_hold",
])
const workflows = new Set([
  "intake",
  "documents_pending",
  "ready_for_preparation",
  "in_preparation",
  "review",
  "signature_pending",
  "ready_to_file",
  "filed",
  "completed",
  "on_hold",
])
const assignments = new Set<ReturnAssignmentFilter>(["all", "mine", "unassigned"])
const reviewers = new Set<ReturnReviewerFilter>(["all", "mine", "unassigned"])
const deadlines = new Set<ReturnDeadlineFilter>([
  "all", "overdue", "due_today", "due_this_week", "next_7_days", "no_due_date",
])

function normalizeTaxYear(value: string | null | undefined) {
  if (!value || value === "all" || !/^\d{4}$/.test(value)) return "all"
  const year = Number(value)
  return year >= 1900 && year <= 2100 ? String(year) : "all"
}
function normalizeId(value: string | null | undefined) {
  const result = value?.trim() ?? ""
  return result === "" ? "all" : result
}

export function normalizeReturnFilters(filters: ReturnFilterUpdates): ReturnFilters {
  const status = filters.status
  const workflow = filters.workflow
  
  const assignment = filters.assignment
  const reviewer = filters.reviewer
  const deadline = filters.deadline
  return {
    search: filters.search?.trim() ?? "",
    status: status && statuses.has(status) ? status as ReturnStatus : "all",
    taxYear: normalizeTaxYear(filters.taxYear),
    preparerId: normalizeId(filters.preparerId),
    assignment: assignment && assignments.has(assignment) ? assignment : "all",
    reviewer: reviewer && reviewers.has(reviewer) ? reviewer : "all",
    deadline: deadline && deadlines.has(deadline) ? deadline : "all",
    workflow:
  workflow && workflows.has(workflow)
    ? workflow
    : "all",
  }
}

export function parseReturnFilters(searchParams: URLSearchParams): ReturnFilters {
  return normalizeReturnFilters({
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    taxYear: searchParams.get("taxYear") ?? undefined,
    preparerId: searchParams.get("preparer") ?? undefined,
    assignment: searchParams.get("assignment") ?? undefined,
    reviewer: searchParams.get("reviewer") ?? undefined,
    deadline: searchParams.get("deadline") ?? undefined,
    workflow: searchParams.get("workflow") ?? undefined,
  } as ReturnFilterUpdates)
}

export function buildReturnFilterSearchParams(filters: ReturnFilterUpdates) {
  const normalized = normalizeReturnFilters(filters)
  const params = new URLSearchParams()
  if (normalized.search) params.set("search", normalized.search)
  if (normalized.status !== "all") params.set("status", normalized.status)
  if (normalized.taxYear !== "all") params.set("taxYear", normalized.taxYear)
  if (normalized.preparerId !== "all") params.set("preparer", normalized.preparerId)
  if (normalized.assignment !== "all") params.set("assignment", normalized.assignment)
  if (normalized.reviewer !== "all") params.set("reviewer", normalized.reviewer)
  if (normalized.deadline !== "all") params.set("deadline", normalized.deadline)
  if (normalized.workflow !== "all") params.set("workflow", normalized.workflow)
  return params
}

export function buildReturnFilterQuery(filters: ReturnFilterUpdates) {
  const query = buildReturnFilterSearchParams(filters).toString()
  return query ? `?${query}` : ""
}
export function mergeReturnFilters(current: ReturnFilters, updates: ReturnFilterUpdates) {
  return normalizeReturnFilters({ ...current, ...updates })
}
export function removeReturnFilter(current: ReturnFilters, key: ReturnFilterKey) {
  return mergeReturnFilters(current, { [key]: defaultReturnFilters[key] })
}
export function clearReturnFilters(): ReturnFilters { return { ...defaultReturnFilters } }
export function isReturnFilterActive(filters: ReturnFilters, key: ReturnFilterKey) {
  return filters[key] !== defaultReturnFilters[key]
}
export function countActiveReturnFilters(filters: ReturnFilters) {
  return (Object.keys(defaultReturnFilters) as ReturnFilterKey[])
    .reduce((count, key) => count + (isReturnFilterActive(filters, key) ? 1 : 0), 0)
}
