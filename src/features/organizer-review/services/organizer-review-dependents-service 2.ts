import {
  supabase,
} from "@/services/supabase"

import type {
  OrganizerReviewDependent,
} from "../types"

interface StaffDependentReviewRow {
  organizer_id: string

  dependent_id: string

  first_name: string

  middle_name:
    string | null

  last_name: string

  suffix:
    string | null

  relationship: string

  birth_date: string

  is_full_time_student:
    boolean

  is_permanently_disabled:
    boolean

  lived_with_taxpayer_all_year:
    boolean

  months_lived_with_taxpayer:
    number

  us_citizen_or_resident:
    boolean

  claimed_by_another_taxpayer:
    boolean

  display_order: number

  created_at: string

  updated_at: string
}

function mapDependentReviewRow(
  row:
    StaffDependentReviewRow,
): OrganizerReviewDependent {
  return {
    organizerId:
      row.organizer_id,

    dependentId:
      row.dependent_id,

    firstName:
      row.first_name,

    middleName:
      row.middle_name,

    lastName:
      row.last_name,

    suffix:
      row.suffix,

    relationship:
      row.relationship as
        OrganizerReviewDependent["relationship"],

    birthDate:
      row.birth_date,

    isFullTimeStudent:
      row.is_full_time_student,

    isPermanentlyDisabled:
      row.is_permanently_disabled,

    livedWithTaxpayerAllYear:
      row.lived_with_taxpayer_all_year,

    monthsLivedWithTaxpayer:
      row.months_lived_with_taxpayer,

    usCitizenOrResident:
      row.us_citizen_or_resident,

    claimedByAnotherTaxpayer:
      row.claimed_by_another_taxpayer,

    displayOrder:
      row.display_order,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

export async function getOrganizerReviewDependents(
  clientId: string,
  taxYear: number,
): Promise<OrganizerReviewDependent[]> {
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
    "get_staff_organizer_dependents_review",
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
        | StaffDependentReviewRow[]
        | null
    ) ?? []
  ).map(
    mapDependentReviewRow,
  )
}
