import type {
  ReturnFilterUpdates,
} from "@/features/returns/types/return.types"

import {
  buildReturnFilterQuery,
} from "@/features/returns/utils/return-filter-utils"

export function getReturnsRoute(
  filters: ReturnFilterUpdates = {},
): string {
  return `/returns${buildReturnFilterQuery(filters)}`
}