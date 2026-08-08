import {
  createContext,
} from "react"

import type {
  TaxOrganizer,
  TaxOrganizerSection,
  TaxOrganizerSummary,
} from "@/features/client-portal/types/tax-organizer.types"

export interface OrganizerContextValue {
  taxYear: number

  summary:
    TaxOrganizerSummary | null

  organizer:
    TaxOrganizer | null

  currentSection:
    TaxOrganizerSection | null

  progress: number
  completedSections: number
  totalSections: number
  remainingSections: number

  isLoading: boolean
  errorMessage: string | null

  refreshOrganizer:
    () => Promise<void>
}

export const OrganizerContext =
  createContext<OrganizerContextValue | null>(
    null,
  )