import type {
  Database,
} from "@/types/database.types"

import { supabase } from "@/services/supabase"

import type {
  ClientProfile,
} from "@/features/client-portal/types/client-profile.types"

type CurrentClientProfileRow =
  Database["public"]["Functions"]["get_current_client_profile"]["Returns"][number]

function mapClientProfile(
  row: CurrentClientProfileRow,
): ClientProfile {
  return {
    id:
      row.portal_profile_id,

    portalProfileId:
      row.portal_profile_id,

    authUserId:
      row.auth_user_id,

    clientId:
      row.client_id,

    clientNumber:
      row.client_number,

    email:
      row.email,

    firstName:
      row.first_name,

    middleName:
      row.middle_name,

    lastName:
      row.last_name,

    preferredName:
      row.preferred_name,

    phone:
      row.phone,

    portalStatus:
      row.portal_status,

    invitedAt:
      row.invited_at,

    activatedAt:
      row.activated_at,

    lastLoginAt:
      row.last_login_at,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  }
}

export async function getCurrentClientProfile(): Promise<ClientProfile | null> {

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_current_client_profile",
    )

  if (error) {
    throw error
  }

  const row =
    data?.[0]

  if (!row) {
    return null
  }

  return mapClientProfile(
    row,
  )
}

export async function recordClientPortalLogin() {

  const {
    error,
  } =
    await supabase.rpc(
      "record_client_portal_login",
    )

  if (error) {
    throw error
  }
}