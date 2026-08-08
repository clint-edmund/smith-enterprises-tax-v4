/**
 * Atlas Fixture Library
 * Values correspond to public.filing_status.
 */

export const filingStatuses = [
  "single",
  "married_filing_jointly",
  "married_filing_separately",
  "head_of_household",
  "qualifying_surviving_spouse",
] as const

export type AtlasFilingStatus =
  (typeof filingStatuses)[number]