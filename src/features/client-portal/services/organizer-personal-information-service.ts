import { supabase } from "@/services/supabase"

import type {
  OrganizerPersonalInformation,
} from "@/features/client-portal/types/organizer-personal-information.types"
import type {
  Database,
} from "@/types/database.types"

export interface SaveOrganizerPersonalInformationRequest {
  organizerId: string

  legalFirstName: string
  legalMiddleName: string
  legalLastName: string
  preferredName: string

  birthDate: string | null
  filingStatus: string
  occupation: string

  email: string
  mobilePhone: string
  alternatePhone: string

  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string

  addressChangedThisYear: boolean | null
  maritalStatusChangedThisYear: boolean | null
  employerChangedThisYear: boolean | null
}

export interface SaveOrganizerPersonalInformationResult {
  organizerId: string
  sectionStatus:
    | "not_started"
    | "in_progress"
    | "completed"
    | "needs_attention"
  sectionProgressPercentage: number
  organizerProgressPercentage: number
  lastSavedAt: string
}

type SavePersonalInformationArgs =
  Database["public"]["Functions"]["save_client_organizer_personal_information"]["Args"]

export async function getOrganizerPersonalInformation(
  organizerId: string,
): Promise<OrganizerPersonalInformation> {
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
    "get_client_organizer_personal_information",
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
    data?.[0]

  if (!row) {
    throw new Error(
      "Personal information could not be loaded.",
    )
  }

  return {
    organizerId:
      row.organizer_id,

    legalFirstName:
      row.legal_first_name ?? "",

    legalMiddleName:
      row.legal_middle_name ?? "",

    legalLastName:
      row.legal_last_name ?? "",

    preferredName:
      row.preferred_name ?? "",

    birthDate:
      row.birth_date,

    filingStatus:
      row.filing_status ?? "",

    occupation:
      row.occupation ?? "",

    email:
      row.email ?? "",

    mobilePhone:
      row.mobile_phone ?? "",

    alternatePhone:
      row.alternate_phone ?? "",

    addressLine1:
      row.address_line_1 ?? "",

    addressLine2:
      row.address_line_2 ?? "",

    city:
      row.city ?? "",

    state:
      row.state ?? "",

    postalCode:
      row.postal_code ?? "",

    addressChangedThisYear:
      row.address_changed_this_year,

    maritalStatusChangedThisYear:
      row.marital_status_changed_this_year,

    employerChangedThisYear:
      row.employer_changed_this_year,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

export async function saveOrganizerPersonalInformation(
  request: SaveOrganizerPersonalInformationRequest,
): Promise<SaveOrganizerPersonalInformationResult> {
  const normalizedOrganizerId =
    request.organizerId.trim()

  if (!normalizedOrganizerId) {
    throw new Error(
      "An organizer identifier is required.",
    )
  }

  const rpcArguments = {
    requested_organizer_id:
      normalizedOrganizerId,

    requested_legal_first_name:
      request.legalFirstName,

    requested_legal_middle_name:
      request.legalMiddleName,

    requested_legal_last_name:
      request.legalLastName,

    requested_preferred_name:
      request.preferredName,

    requested_birth_date:
      request.birthDate,

    requested_filing_status:
      request.filingStatus,

    requested_occupation:
      request.occupation,

    requested_email:
      request.email,

    requested_mobile_phone:
      request.mobilePhone,

    requested_alternate_phone:
      request.alternatePhone,

    requested_address_line_1:
      request.addressLine1,

    requested_address_line_2:
      request.addressLine2,

    requested_city:
      request.city,

    requested_state:
      request.state,

    requested_postal_code:
      request.postalCode,

    requested_address_changed_this_year:
      request.addressChangedThisYear,

    requested_marital_status_changed_this_year:
      request.maritalStatusChangedThisYear,

    requested_employer_changed_this_year:
      request.employerChangedThisYear,
  } as unknown as SavePersonalInformationArgs

  const {
    data,
    error,
  } = await supabase.rpc(
    "save_client_organizer_personal_information",
    rpcArguments,
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
      "Personal information could not be saved.",
    )
  }

  return {
    organizerId:
      row.organizer_id,

    sectionStatus:
      row.section_status,

    sectionProgressPercentage:
      row.section_progress_percentage,

    organizerProgressPercentage:
      row.organizer_progress_percentage,

    lastSavedAt:
      row.last_saved_at,
  }
}
