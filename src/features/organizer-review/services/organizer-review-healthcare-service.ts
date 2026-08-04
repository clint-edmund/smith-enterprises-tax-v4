import {
  supabase,
} from "@/services/supabase"

import type {
  OrganizerReviewHealthcareCoverage,
} from "../types"

interface StaffHealthcareReviewRow {
  organizer_id: string

  coverage_id: string

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

  record_status: string

  display_order: number

  created_at: string

  updated_at: string
}

function mapHealthcareReviewRow(
  row:
    StaffHealthcareReviewRow,
): OrganizerReviewHealthcareCoverage {
  return {
    organizerId:
      row.organizer_id,

    coverageId:
      row.coverage_id,

    providerName:
      row.provider_name,

    coverageType:
      row.coverage_type as
        OrganizerReviewHealthcareCoverage["coverageType"],

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
        OrganizerReviewHealthcareCoverage["documentType"],

    notes:
      row.notes ?? "",

    recordStatus:
      row.record_status as
        OrganizerReviewHealthcareCoverage["recordStatus"],

    displayOrder:
      row.display_order,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

export async function getOrganizerReviewHealthcare(
  clientId: string,
  taxYear: number,
): Promise<OrganizerReviewHealthcareCoverage[]> {
  const normalizedClientId =
    clientId.trim()

  if (!normalizedClientId) {
    throw new Error(
      "A client identifier is required.",
    )
  }

  if (
    !Number.isInteger(
      taxYear,
    ) ||
    taxYear < 1900 ||
    taxYear > 2200
  ) {
    throw new Error(
      "A valid tax year is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_staff_organizer_healthcare_review",
    {
      requested_client_id:
        normalizedClientId,

      requested_tax_year:
        taxYear,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  return (
    (
      data as
        | StaffHealthcareReviewRow[]
        | null
    ) ?? []
  ).map(
    mapHealthcareReviewRow,
  )
}
