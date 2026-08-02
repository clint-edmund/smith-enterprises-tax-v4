import {
  supabase,
} from "@/services/supabase"

import type {
  CreateIncomeSourceRequest,
  DeleteIncomeSourceRequest,
  IncomeRecipient,
  IncomeStatus,
  IncomeType,
  OrganizerIncomeSource,
  OrganizerIncomeW2Details,
  SaveIncomeW2DetailsRequest,
  SaveIncomeW2DetailsResponse,
  UpdateIncomeSourceRequest,
} from "@/features/client-portal/types/organizer-income.types"

interface IncomeSourceRow {
  income_source_id: string
  organizer_id: string
  income_type: string
  payer_name: string
  recipient_type: string
  record_status: string
  document_received: boolean
  notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

interface DeleteIncomeSourceRow {
  income_source_id: string
  organizer_id: string
  payer_name: string
  remaining_income_source_count: number
  deleted_at: string
}

interface IncomeW2DetailsRow {
  income_source_id: string

  employer_identification_number:
    string | null

  wages:
    number | null

  federal_income_tax_withheld:
    number | null

  social_security_wages:
    number | null

  social_security_tax_withheld:
    number | null

  medicare_wages:
    number | null

  medicare_tax_withheld:
    number | null

  state_code:
    string | null

  state_wages:
    number | null

  state_income_tax_withheld:
    number | null

  local_wages:
    number | null

  local_income_tax_withheld:
    number | null

  created_at:
    string | null

  updated_at:
    string | null
}

interface SaveIncomeW2DetailsRow {
  income_source_id: string

  organizer_id: string

  income_type: string

  payer_name: string

  recipient_type: string

  record_status: string

  document_received: boolean

  notes:
    string | null

  display_order: number

  income_created_at: string

  income_updated_at: string

  employer_identification_number:
    string | null

  wages:
    number | null

  federal_income_tax_withheld:
    number | null

  social_security_wages:
    number | null

  social_security_tax_withheld:
    number | null

  medicare_wages:
    number | null

  medicare_tax_withheld:
    number | null

  state_code:
    string | null

  state_wages:
    number | null

  state_income_tax_withheld:
    number | null

  local_wages:
    number | null

  local_income_tax_withheld:
    number | null

  w2_created_at:
    string | null

  w2_updated_at:
    string | null
}

export interface DeleteIncomeSourceResponse {
  incomeSourceId: string
  organizerId: string
  payerName: string
  remainingIncomeSourceCount: number
  deletedAt: string
}

function mapIncomeSourceRow(
  row: IncomeSourceRow,
): OrganizerIncomeSource {
  return {
    incomeSourceId:
      row.income_source_id,

    organizerId:
      row.organizer_id,

    incomeType:
      row.income_type as IncomeType,

    payerName:
      row.payer_name,

    recipientType:
      row.recipient_type as IncomeRecipient,

    recordStatus:
      row.record_status as IncomeStatus,

    documentReceived:
      row.document_received,

    notes:
      row.notes ?? "",

    displayOrder:
      row.display_order,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

function mapDeleteIncomeSourceRow(
  row: DeleteIncomeSourceRow,
): DeleteIncomeSourceResponse {
  return {
    incomeSourceId:
      row.income_source_id,

    organizerId:
      row.organizer_id,

    payerName:
      row.payer_name,

    remainingIncomeSourceCount:
      row.remaining_income_source_count,

    deletedAt:
      row.deleted_at,
  }
}

function mapIncomeW2DetailsRow(
  row:
    IncomeW2DetailsRow,
): OrganizerIncomeW2Details {
  return {
    incomeSourceId:
      row.income_source_id,

    employerIdentificationNumber:
      row.employer_identification_number ??
      "",

    wages:
      row.wages,

    federalIncomeTaxWithheld:
      row.federal_income_tax_withheld,

    socialSecurityWages:
      row.social_security_wages,

    socialSecurityTaxWithheld:
      row.social_security_tax_withheld,

    medicareWages:
      row.medicare_wages,

    medicareTaxWithheld:
      row.medicare_tax_withheld,

    stateCode:
      row.state_code ?? "",

    stateWages:
      row.state_wages,

    stateIncomeTaxWithheld:
      row.state_income_tax_withheld,

    localWages:
      row.local_wages,

    localIncomeTaxWithheld:
      row.local_income_tax_withheld,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

export async function getOrganizerIncomeSources(
  organizerId: string,
): Promise<OrganizerIncomeSource[]> {
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
    "get_client_organizer_income_sources",
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
        | IncomeSourceRow[]
        | null
    ) ?? []
  ).map(
    mapIncomeSourceRow,
  )
}

export async function createOrganizerIncomeSource(
  request:
    CreateIncomeSourceRequest,
): Promise<OrganizerIncomeSource> {
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
    "create_client_organizer_income_source",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_income_type:
        request.incomeType,

      requested_payer_name:
        request.payerName,

      requested_recipient_type:
        request.recipientType,

      requested_notes:
        request.notes,
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
        | IncomeSourceRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The income source could not be created.",
    )
  }

  return mapIncomeSourceRow(
    row,
  )
}

export async function updateOrganizerIncomeSource(
  request:
    UpdateIncomeSourceRequest,
): Promise<OrganizerIncomeSource> {
  const normalizedOrganizerId =
    request.organizerId.trim()

  const normalizedIncomeSourceId =
    request.incomeSourceId.trim()

  if (!normalizedOrganizerId) {
    throw new Error(
      "An organizer identifier is required.",
    )
  }

  if (!normalizedIncomeSourceId) {
    throw new Error(
      "An income source identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "update_client_organizer_income_source",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_income_source_id:
        normalizedIncomeSourceId,

      requested_payer_name:
        request.payerName,

      requested_recipient_type:
        request.recipientType,

      requested_record_status:
        request.recordStatus,

      requested_document_received:
        request.documentReceived,

      requested_notes:
        request.notes,
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
        | IncomeSourceRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The income source could not be updated.",
    )
  }

  return mapIncomeSourceRow(
    row,
  )
}

export async function deleteOrganizerIncomeSource(
  request:
    DeleteIncomeSourceRequest,
): Promise<DeleteIncomeSourceResponse> {
  const normalizedOrganizerId =
    request.organizerId.trim()

  const normalizedIncomeSourceId =
    request.incomeSourceId.trim()

  if (!normalizedOrganizerId) {
    throw new Error(
      "An organizer identifier is required.",
    )
  }

  if (!normalizedIncomeSourceId) {
    throw new Error(
      "An income source identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "delete_client_organizer_income_source",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_income_source_id:
        normalizedIncomeSourceId,
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
        | DeleteIncomeSourceRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The income source could not be deleted.",
    )
  }

  return mapDeleteIncomeSourceRow(
    row,
  )
}

export async function getOrganizerIncomeW2Details(
  organizerId: string,
  incomeSourceId: string,
): Promise<OrganizerIncomeW2Details> {
  const normalizedOrganizerId =
    organizerId.trim()

  const normalizedIncomeSourceId =
    incomeSourceId.trim()

  if (!normalizedOrganizerId) {
    throw new Error(
      "An organizer identifier is required.",
    )
  }

  if (!normalizedIncomeSourceId) {
    throw new Error(
      "An income source identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_client_organizer_income_w2_details",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_income_source_id:
        normalizedIncomeSourceId,
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
        | IncomeW2DetailsRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The W-2 details could not be loaded.",
    )
  }

  return mapIncomeW2DetailsRow(
    row,
  )
}

export async function saveOrganizerIncomeW2Details(
  request:
    SaveIncomeW2DetailsRequest,
): Promise<SaveIncomeW2DetailsResponse> {
  const normalizedOrganizerId =
    request.organizerId.trim()

  const normalizedIncomeSourceId =
    request.incomeSourceId.trim()

  if (!normalizedOrganizerId) {
    throw new Error(
      "An organizer identifier is required.",
    )
  }

  if (!normalizedIncomeSourceId) {
    throw new Error(
      "An income source identifier is required.",
    )
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "save_client_organizer_income_w2_details",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_income_source_id:
        normalizedIncomeSourceId,

      requested_employer_identification_number:
        request.employerIdentificationNumber,

      requested_wages:
        request.wages,

      requested_federal_income_tax_withheld:
        request.federalIncomeTaxWithheld,

      requested_social_security_wages:
        request.socialSecurityWages,

      requested_social_security_tax_withheld:
        request.socialSecurityTaxWithheld,

      requested_medicare_wages:
        request.medicareWages,

      requested_medicare_tax_withheld:
        request.medicareTaxWithheld,

      requested_state_code:
        request.stateCode,

      requested_state_wages:
        request.stateWages,

      requested_state_income_tax_withheld:
        request.stateIncomeTaxWithheld,

      requested_local_wages:
        request.localWages,

      requested_local_income_tax_withheld:
        request.localIncomeTaxWithheld,

      requested_document_received:
        request.documentReceived,
    } as unknown as {
      requested_organizer_id: string
      requested_income_source_id: string
      requested_employer_identification_number: string
      requested_wages: number
      requested_federal_income_tax_withheld: number
      requested_social_security_wages: number
      requested_social_security_tax_withheld: number
      requested_medicare_wages: number
      requested_medicare_tax_withheld: number
      requested_state_code: string
      requested_state_wages: number
      requested_state_income_tax_withheld: number
      requested_local_wages: number
      requested_local_income_tax_withheld: number
      requested_document_received: boolean
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
        | SaveIncomeW2DetailsRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "The W-2 details could not be saved.",
    )
  }

  const incomeSource:
    OrganizerIncomeSource = {
      incomeSourceId:
        row.income_source_id,

      organizerId:
        row.organizer_id,

      incomeType:
        row.income_type as
          IncomeType,

      payerName:
        row.payer_name,

      recipientType:
        row.recipient_type as
          IncomeRecipient,

      recordStatus:
        row.record_status as
          IncomeStatus,

      documentReceived:
        row.document_received,

      notes:
        row.notes ?? "",

      displayOrder:
        row.display_order,

      createdAt:
        row.income_created_at,

      updatedAt:
        row.income_updated_at,
    }

  const w2Details:
    OrganizerIncomeW2Details = {
      incomeSourceId:
        row.income_source_id,

      employerIdentificationNumber:
        row.employer_identification_number ??
        "",

      wages:
        row.wages,

      federalIncomeTaxWithheld:
        row.federal_income_tax_withheld,

      socialSecurityWages:
        row.social_security_wages,

      socialSecurityTaxWithheld:
        row.social_security_tax_withheld,

      medicareWages:
        row.medicare_wages,

      medicareTaxWithheld:
        row.medicare_tax_withheld,

      stateCode:
        row.state_code ?? "",

      stateWages:
        row.state_wages,

      stateIncomeTaxWithheld:
        row.state_income_tax_withheld,

      localWages:
        row.local_wages,

      localIncomeTaxWithheld:
        row.local_income_tax_withheld,

      createdAt:
        row.w2_created_at,

      updatedAt:
        row.w2_updated_at,
    }

  return {
    incomeSource,
    w2Details,
  }
}