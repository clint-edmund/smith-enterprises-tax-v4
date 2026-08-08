import { supabase } from "@/services/supabase"

import type {
  TaxOrganizer,
  TaxOrganizerSection,
  TaxOrganizerSectionKey,
  TaxOrganizerSectionStatus,
  TaxOrganizerStatus,
  TaxOrganizerSummary,
} from "@/features/client-portal/types/tax-organizer.types"

interface OrganizerSectionRow {
  id: string
  organizer_id: string
  section_key: TaxOrganizerSectionKey
  status: TaxOrganizerSectionStatus
  progress_percentage: number
  started_at: string | null
  completed_at: string | null
  last_saved_at: string | null
  created_at: string
  updated_at: string
}

function mapOrganizerSection(
  section: OrganizerSectionRow,
): TaxOrganizerSection {
  return {
    id: section.id,
    organizerId: section.organizer_id,
    sectionKey: section.section_key,
    status: section.status,
    progressPercentage:
      section.progress_percentage,
    startedAt: section.started_at,
    completedAt: section.completed_at,
    lastSavedAt: section.last_saved_at,
    createdAt: section.created_at,
    updatedAt: section.updated_at,
  }
}

export async function getOrCreateClientTaxOrganizer(
  taxYear: number,
): Promise<TaxOrganizerSummary> {
  if (
    !Number.isInteger(taxYear) ||
    taxYear < 2000 ||
    taxYear > 2100
  ) {
    throw new Error(
      "A valid tax year is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_or_create_client_tax_organizer",
    {
      requested_tax_year:
        taxYear,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    data?.[0]

  if (!row) {
    throw new Error(
      "The tax organizer could not be loaded.",
    )
  }

  const rawSections =
    Array.isArray(row.sections)
      ? row.sections
      : []

  const sections =
    rawSections.map(
      (section) =>
        mapOrganizerSection(
          section as unknown as OrganizerSectionRow,
        ),
    )

  const organizer: TaxOrganizer = {
    id: row.organizer_id,
    clientId: row.client_id,
    taxYear: row.tax_year,
    status:
      row.organizer_status as TaxOrganizerStatus,
    currentSection:
      row.current_section as TaxOrganizerSectionKey,
    progressPercentage:
      row.progress_percentage,
    startedAt: row.started_at,
    lastSavedAt: row.last_saved_at,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }

  return {
    organizer,
    sections,
    completedSections:
      sections.filter(
        (section) =>
          section.status ===
          "completed",
      ).length,
    totalSections:
      sections.length,
  }
}