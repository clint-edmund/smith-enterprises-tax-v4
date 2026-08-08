import {
  supabase,
} from "@/services/supabase"

import type {
  AddOrganizerDependentRequest,
  AddOrganizerDependentResponse,
  DeleteOrganizerDependentRequest,
  DeleteOrganizerDependentResponse,
  OrganizerDependent,
  UpdateOrganizerDependentRequest,
  UpdateOrganizerDependentResponse,
} from "@/features/client-portal/types/organizer-dependent.types"

interface AddDependentRow {
  dependent_id: string

  organizer_id: string

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

  section_status:
    | "not_started"
    | "in_progress"
    | "completed"
    | "needs_review"

  section_progress_percentage:
    number

  organizer_progress_percentage:
    number

  created_at: string

  updated_at: string
}

interface GetDependentRow {
  dependent_id: string

  organizer_id: string

  first_name: string

  middle_name: string | null

  last_name: string

  suffix: string | null

  relationship: string

  birth_date: string

  is_full_time_student: boolean

  is_permanently_disabled: boolean

  lived_with_taxpayer_all_year: boolean

  months_lived_with_taxpayer: number

  us_citizen_or_resident: boolean

  claimed_by_another_taxpayer: boolean

  display_order: number

  created_at: string

  updated_at: string
}

interface DeleteDependentRow {
  dependent_id: string
  organizer_id: string
  dependent_name: string
  remaining_dependent_count: number

  section_status:
    | "not_started"
    | "in_progress"
    | "completed"
    | "needs_review"

  section_progress_percentage: number
  organizer_progress_percentage: number
  deleted_at: string
}

function mapAddDependentRow(
  row: AddDependentRow,
): AddOrganizerDependentResponse {
  return {
    dependentId:
      row.dependent_id,

    organizerId:
      row.organizer_id,

    firstName:
      row.first_name,

    middleName:
      row.middle_name ?? "",

    lastName:
      row.last_name,

    suffix:
      row.suffix ?? "",

    relationship:
      row.relationship as
        AddOrganizerDependentResponse["relationship"],

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

    sectionStatus:
      row.section_status,

    sectionProgressPercentage:
      row.section_progress_percentage,

    organizerProgressPercentage:
      row.organizer_progress_percentage,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

function mapGetDependentRow(
  row: GetDependentRow,
): OrganizerDependent {
  return {
    dependentId: row.dependent_id,

    organizerId: row.organizer_id,

    firstName: row.first_name,

    middleName: row.middle_name ?? "",

    lastName: row.last_name,

    suffix: row.suffix ?? "",

    relationship:
      row.relationship as OrganizerDependent["relationship"],

    birthDate: row.birth_date,

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

    sectionStatus:
      "in_progress",

    sectionProgressPercentage:
      50,

    organizerProgressPercentage:
      0,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

function mapDeleteDependentRow(
  row: DeleteDependentRow,
): DeleteOrganizerDependentResponse {
  return {
    dependentId:
      row.dependent_id,

    organizerId:
      row.organizer_id,

    dependentName:
      row.dependent_name,

    remainingDependentCount:
      row.remaining_dependent_count,

    sectionStatus:
      row.section_status,

    sectionProgressPercentage:
      row.section_progress_percentage,

    organizerProgressPercentage:
      row.organizer_progress_percentage,

    deletedAt:
      row.deleted_at,
  }
}

export async function addOrganizerDependent(
  request:
    AddOrganizerDependentRequest,
): Promise<AddOrganizerDependentResponse> {
  const normalizedOrganizerId =
    request.organizerId.trim()

  if (!normalizedOrganizerId) {
    throw new Error(
      "An organizer identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "add_client_organizer_dependent",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_first_name:
        request.firstName,

      requested_middle_name:
        request.middleName,

      requested_last_name:
        request.lastName,

      requested_suffix:
        request.suffix,

      requested_relationship:
        request.relationship,

      requested_birth_date:
        request.birthDate,

      requested_is_full_time_student:
        request.isFullTimeStudent,

      requested_is_permanently_disabled:
        request.isPermanentlyDisabled,

      requested_lived_with_taxpayer_all_year:
        request.livedWithTaxpayerAllYear,

      requested_months_lived_with_taxpayer:
        request.monthsLivedWithTaxpayer,

      requested_us_citizen_or_resident:
        request.usCitizenOrResident,

      requested_claimed_by_another_taxpayer:
        request.claimedByAnotherTaxpayer,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    (
      data as
        | AddDependentRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The dependent could not be added.",
    )
  }

  return mapAddDependentRow(
    row,
  )
}

export async function getOrganizerDependents(
  organizerId: string,
): Promise<OrganizerDependent[]> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_client_organizer_dependents",
    {
      requested_organizer_id:
        organizerId,
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
        | GetDependentRow[]
        | null
    ) ?? []
  ).map(
    mapGetDependentRow,
  )
}

export async function updateOrganizerDependent(
  request:
    UpdateOrganizerDependentRequest,
): Promise<UpdateOrganizerDependentResponse> {
  const normalizedOrganizerId =
    request.organizerId.trim()

  const normalizedDependentId =
    request.dependentId.trim()

  if (!normalizedOrganizerId) {
    throw new Error(
      "An organizer identifier is required.",
    )
  }

  if (!normalizedDependentId) {
    throw new Error(
      "A dependent identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "update_client_organizer_dependent",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_dependent_id:
        normalizedDependentId,

      requested_first_name:
        request.firstName,

      requested_middle_name:
        request.middleName,

      requested_last_name:
        request.lastName,

      requested_suffix:
        request.suffix,

      requested_relationship:
        request.relationship,

      requested_birth_date:
        request.birthDate,

      requested_is_full_time_student:
        request.isFullTimeStudent,

      requested_is_permanently_disabled:
        request.isPermanentlyDisabled,

      requested_lived_with_taxpayer_all_year:
        request.livedWithTaxpayerAllYear,

      requested_months_lived_with_taxpayer:
        request.monthsLivedWithTaxpayer,

      requested_us_citizen_or_resident:
        request.usCitizenOrResident,

      requested_claimed_by_another_taxpayer:
        request.claimedByAnotherTaxpayer,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    (
      data as
        | AddDependentRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The dependent could not be updated.",
    )
  }

  return mapAddDependentRow(
    row,
  )
}

export async function deleteOrganizerDependent(
  request:
    DeleteOrganizerDependentRequest,
): Promise<DeleteOrganizerDependentResponse> {
  const normalizedOrganizerId =
    request.organizerId.trim()

  const normalizedDependentId =
    request.dependentId.trim()

  if (!normalizedOrganizerId) {
    throw new Error(
      "An organizer identifier is required.",
    )
  }

  if (!normalizedDependentId) {
    throw new Error(
      "A dependent identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "delete_client_organizer_dependent",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_dependent_id:
        normalizedDependentId,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    (
      data as
        | DeleteDependentRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The dependent could not be deleted.",
    )
  }

  return mapDeleteDependentRow(
    row,
  )
}