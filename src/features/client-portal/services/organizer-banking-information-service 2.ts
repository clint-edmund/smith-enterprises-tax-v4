import {
  supabase,
} from "@/services/supabase"

import type {
  OrganizerBankingInformation,
  SaveOrganizerBankingInformationRequest,
  SaveOrganizerBankingInformationResponse,
} from "@/features/client-portal/types/organizer-banking-information.types"

interface BankingInformationRow {
  organizer_id: string

  account_holder_name:
    string | null

  bank_name:
    string | null

  account_type:
    | "checking"
    | "savings"
    | null

  use_direct_deposit:
    boolean | null

  authorize_direct_debit:
    boolean | null

  has_routing_number:
    boolean

  routing_number_masked:
    string | null

  has_bank_account_number:
    boolean

  bank_account_number_masked:
    string | null

  created_at:
    string | null

  updated_at:
    string | null
}

interface SaveBankingInformationRow {
  organizer_id: string

  section_status:
    | "not_started"
    | "in_progress"
    | "completed"
    | "needs_review"

  section_progress_percentage:
    number

  organizer_progress_percentage:
    number

  saved_at: string
}

function mapBankingInformation(
  row: BankingInformationRow,
): OrganizerBankingInformation {
  return {
    organizerId:
      row.organizer_id,

    accountHolderName:
      row.account_holder_name ??
      "",

    bankName:
      row.bank_name ?? "",

    accountType:
      row.account_type ?? "",

    useDirectDeposit:
      row.use_direct_deposit,

    authorizeDirectDebit:
      row.authorize_direct_debit,

    hasRoutingNumber:
      row.has_routing_number,

    routingNumberMasked:
      row.routing_number_masked,

    hasBankAccountNumber:
      row.has_bank_account_number,

    bankAccountNumberMasked:
      row.bank_account_number_masked,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

function mapSaveResponse(
  row: SaveBankingInformationRow,
): SaveOrganizerBankingInformationResponse {
  return {
    organizerId:
      row.organizer_id,

    sectionStatus:
      row.section_status,

    sectionProgressPercentage:
      row.section_progress_percentage,

    organizerProgressPercentage:
      row.organizer_progress_percentage,

    savedAt:
      row.saved_at,
  }
}

export async function getOrganizerBankingInformation(
  organizerId: string,
): Promise<OrganizerBankingInformation> {
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
    "get_client_organizer_banking_information",
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

  const row =
    (
      data as
        | BankingInformationRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "Banking information could not be loaded.",
    )
  }

  return mapBankingInformation(
    row,
  )
}

export async function saveOrganizerBankingInformation(
  request:
    SaveOrganizerBankingInformationRequest,
): Promise<SaveOrganizerBankingInformationResponse> {
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
    "save_client_organizer_banking_information",
    {
      requested_organizer_id:
        normalizedOrganizerId,

      requested_account_holder_name:
        request.accountHolderName,

      requested_bank_name:
        request.bankName,

      requested_account_type:
        request.accountType,

      requested_use_direct_deposit:
        request.useDirectDeposit ??
        false,

      requested_authorize_direct_debit:
        request.authorizeDirectDebit ??
        false,
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
        | SaveBankingInformationRow[]
        | null
    )?.[0]

  if (!row) {
    throw new Error(
      "Banking information could not be saved.",
    )
  }

  return mapSaveResponse(
    row,
  )
}