import {
  supabase,
} from "@/services/supabase"

import type {
  Database,
} from "@/types/database.types"

import type {
  CreateOrganizerHealthcareCoverageRequest,
  DeleteOrganizerHealthcareCoverageRequest,
  OrganizerHealthcareCoverage,
  UpdateOrganizerHealthcareCoverageRequest,
} from "@/features/client-portal/types/organizer-healthcare.types"

export interface OrganizerHealthcareFilters {
  search?: string

  coverageType?: string

  recordStatus?: string

  documentReceived?: boolean
}

interface HealthcareCoverageRow {
  coverage_id: string

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

  record_status: string

  display_order: number

  created_at: string

  updated_at: string
}

function mapHealthcareCoverage(
  row:
    HealthcareCoverageRow,
): OrganizerHealthcareCoverage {
  return {
    coverageId:
      row.coverage_id,

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

function getFirstHealthcareCoverageRow(
  data:
    HealthcareCoverageRow[] | null,
): HealthcareCoverageRow {
  const row =
    data?.[0]

  if (!row) {
    throw new Error(
      "The healthcare coverage was not returned by the server.",
    )
  }

  return row
}

export async function getOrganizerHealthcareCoverages(
  organizerId: string,
): Promise<OrganizerHealthcareCoverage[]> {
  const normalizedOrganizerId =
    organizerId.trim()

  if (!normalizedOrganizerId) {
    throw new Error(
      "An organizer identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_client_organizer_healthcare_coverages",
    {
      requested_organizer_id:
        normalizedOrganizerId,
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
        | HealthcareCoverageRow[]
        | null
    ) ?? []
  ).map(
    mapHealthcareCoverage,
  )
}

export async function createOrganizerHealthcareCoverage(
  request:
    CreateOrganizerHealthcareCoverageRequest,
): Promise<OrganizerHealthcareCoverage> {
  const rpcArgs =
  {
    requested_organizer_id:
      request.organizerId,

    requested_provider_name:
      request.providerName,

    requested_coverage_type:
      request.coverageType,

    requested_covered_person_name:
      request.coveredPersonName,

    requested_policy_number:
      request.policyNumber,

    requested_start_month:
      request.startMonth,

    requested_end_month:
      request.endMonth,

    requested_is_full_year_coverage:
      request.isFullYearCoverage,

    requested_document_received:
      request.documentReceived,

    requested_document_type:
      request.documentType,

    requested_notes:
      request.notes,
  } as unknown as Database["public"]["Functions"]["create_client_organizer_healthcare_coverage"]["Args"]

const {
  data,
  error,
} = await supabase.rpc(
  "create_client_organizer_healthcare_coverage",
  rpcArgs,
)

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    getFirstHealthcareCoverageRow(
      data as
        | HealthcareCoverageRow[]
        | null,
    )

  return mapHealthcareCoverage(
    row,
  )
}

export async function updateOrganizerHealthcareCoverage(
  request:
    UpdateOrganizerHealthcareCoverageRequest,
): Promise<OrganizerHealthcareCoverage> {
  const rpcArgs =
  {
    requested_organizer_id:
      request.organizerId,

    requested_coverage_id:
      request.coverageId,

    requested_provider_name:
      request.providerName,

    requested_coverage_type:
      request.coverageType,

    requested_covered_person_name:
      request.coveredPersonName,

    requested_policy_number:
      request.policyNumber,

    requested_start_month:
      request.startMonth,

    requested_end_month:
      request.endMonth,

    requested_is_full_year_coverage:
      request.isFullYearCoverage,

    requested_document_received:
      request.documentReceived,

    requested_document_type:
      request.documentType,

    requested_notes:
      request.notes,
  } as unknown as Database["public"]["Functions"]["update_client_organizer_healthcare_coverage"]["Args"]

const {
  data,
  error,
} = await supabase.rpc(
  "update_client_organizer_healthcare_coverage",
  rpcArgs,
)

  if (error) {
    throw new Error(
      error.message,
    )
  }

  const row =
    getFirstHealthcareCoverageRow(
      data as
        | HealthcareCoverageRow[]
        | null,
    )

  return mapHealthcareCoverage(
    row,
  )
}

export async function deleteOrganizerHealthcareCoverage(
  request:
    DeleteOrganizerHealthcareCoverageRequest,
): Promise<void> {
  const {
    error,
  } = await supabase.rpc(
    "delete_client_organizer_healthcare_coverage",
    {
      requested_organizer_id:
        request.organizerId,

      requested_coverage_id:
        request.coverageId,
    },
  )

  if (error) {
    throw new Error(
      error.message,
    )
  }
}
