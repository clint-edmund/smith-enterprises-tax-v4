import {
  supabase,
} from "@/services/supabase"

import type {
  OrganizerHealthcareCoverage,
} from "@/features/client-portal/types/organizer-healthcare.types"

export interface OrganizerHealthcareFilters {
  search?: string

  coverageType?: string

  recordStatus?: string

  documentReceived?: boolean
}

interface HealthcareCoverageRow {
  id: string

  organizer_id: string

  provider_name: string

  coverage_type: string

  covered_person_name: string

  policy_number:
    string | null

  start_month:
    number | null

  end_month:
    number | null

  is_full_year_coverage:
    boolean

  document_received:
    boolean

  document_type:
    string | null

  notes:
    string | null

  record_status:
    string

  display_order:
    number

  created_at: string

  updated_at: string
}

function mapHealthcareCoverage(
  row:
    HealthcareCoverageRow,
): OrganizerHealthcareCoverage {
  return {
    coverageId:
      row.id,

    organizerId:
      row.organizer_id,

    providerName:
      row.provider_name,

    coverageType:
      row.coverage_type as
        OrganizerHealthcareCoverage["coverageType"],

    coveredPersonName:
      row.covered_person_name,

    policyNumber:
      row.policy_number,

    startMonth:
      row.start_month,

    endMonth:
      row.end_month,

    isFullYearCoverage:
      row.is_full_year_coverage,

    documentReceived:
      row.document_received,

    documentType:
      row.document_type as
        OrganizerHealthcareCoverage["documentType"],

    notes:
      row.notes ?? "",

   recordStatus:
      row.record_status as
        OrganizerHealthcareCoverage["recordStatus"],

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

export async function
getOrganizerHealthcareCoverages(
  organizerId: string,
): Promise<
  OrganizerHealthcareCoverage[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "client_tax_organizer_healthcare_coverages",
      )
      .select("*")
      .eq(
        "organizer_id",
        organizerId,
      )
      .order(
        "display_order",
      )

  if (error) {
    throw error
  }

  return (
    data ?? []
  ).map(
    mapHealthcareCoverage,
  )
}