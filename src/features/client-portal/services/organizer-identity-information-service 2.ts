import { supabase } from "@/services/supabase"

import type {
  Database,
} from "@/types/database.types"

import type {
  OrganizerCitizenshipStatus,
  OrganizerIdentificationType,
  OrganizerIdentityInformation,
} from "@/features/client-portal/types/organizer-identity-information.types"

export interface SaveOrganizerIdentityInformationRequest {
  organizerId: string

  identificationType:
    OrganizerIdentificationType

  identificationState: string

  identificationIssueDate:
    string | null

  identificationExpirationDate:
    string | null

  citizenshipStatus:
    OrganizerCitizenshipStatus

  isUsCitizen: boolean | null

  hasGovernmentPhotoId:
    boolean | null

  hasIdentityChanged:
    boolean | null
}

export interface SaveOrganizerIdentityInformationResult {
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

type SaveIdentityInformationArgs =
  Database["public"]["Functions"]["save_client_organizer_identity_information"]["Args"]

export async function getOrganizerIdentityInformation(
  organizerId: string,
): Promise<OrganizerIdentityInformation> {
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
    "get_client_organizer_identity_information",
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
      "Identity information could not be loaded.",
    )
  }

  return {
    organizerId:
      row.result_organizer_id,

    identificationType:
      (
        row.identification_type ??
        ""
      ) as OrganizerIdentificationType,

    identificationState:
      row.identification_state ?? "",

    identificationIssueDate:
      row.identification_issue_date,

    identificationExpirationDate:
      row.identification_expiration_date,

    citizenshipStatus:
      (
        row.citizenship_status ??
        ""
      ) as OrganizerCitizenshipStatus,

    isUsCitizen:
      row.is_us_citizen,

    hasGovernmentPhotoId:
      row.has_government_photo_id,

    hasIdentityChanged:
      row.has_identity_changed,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

export async function saveOrganizerIdentityInformation(
  request:
    SaveOrganizerIdentityInformationRequest,
): Promise<SaveOrganizerIdentityInformationResult> {
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

    requested_identification_type:
      request.identificationType,

    requested_identification_state:
      request.identificationState,

    requested_identification_issue_date:
      request.identificationIssueDate,

    requested_identification_expiration_date:
      request.identificationExpirationDate,

    requested_citizenship_status:
      request.citizenshipStatus,

    requested_is_us_citizen:
      request.isUsCitizen,

    requested_has_government_photo_id:
      request.hasGovernmentPhotoId,

    requested_has_identity_changed:
      request.hasIdentityChanged,
  } as unknown as SaveIdentityInformationArgs

  const {
    data,
    error,
  } = await supabase.rpc(
    "save_client_organizer_identity_information",
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
      "Identity information could not be saved.",
    )
  }

  return {
    organizerId:
      row.result_organizer_id,

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