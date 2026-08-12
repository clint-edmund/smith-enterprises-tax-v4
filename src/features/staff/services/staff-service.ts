import {
  supabase,
} from "@/services/supabase"

import type {
  StaffAdminAuditEvent,
  StaffDirectoryItem,
} from "@/features/staff/types/staff.types"

export async function getStaffDirectory(): Promise<
  StaffDirectoryItem[]
> {
  const { data, error } =
    await supabase.rpc(
      "get_staff_directory",
    )

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    phone: row.phone,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getStaffAdminAuditHistory(
  limit = 100,
): Promise<StaffAdminAuditEvent[]> {
  const { data, error } =
    await supabase.rpc(
      "get_staff_admin_audit_history",
      {
        requested_limit: limit,
      },
    )

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    actorUserId: row.actor_user_id,
    actorEmail: row.actor_email,
    actorDisplayName: row.actor_display_name,
    targetStaffId: row.target_staff_id,
    targetEmail: row.target_email,
    action: row.action,
    outcome: row.outcome,
    previousRole: row.previous_role,
    newRole: row.new_role,
    previousIsActive:
      row.previous_is_active,
    newIsActive:
      row.new_is_active,
    metadata: row.metadata,
    createdAt: row.created_at,
  }))
}

export async function updateStaffRole(
  staffId: string,
  role: StaffDirectoryItem["role"],
): Promise<StaffDirectoryItem> {
  const { data, error } =
    await supabase.rpc(
      "update_staff_role",
      {
        target_staff_id: staffId,
        new_role: role,
      },
    )

  if (error) {
    throw error
  }

  const row = data?.[0]

  if (!row) {
    throw new Error(
      "The staff role was updated, but the updated staff record was not returned.",
    )
  }

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    phone: row.phone,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function updateStaffStatus(
  staffId: string,
  isActive: boolean,
): Promise<StaffDirectoryItem> {
  const { data, error } =
    await supabase.rpc(
      "update_staff_status",
      {
        target_staff_id: staffId,
        new_is_active: isActive,
      },
    )

  if (error) {
    throw error
  }

  const row = data?.[0]

  if (!row) {
    throw new Error(
      "The staff status was updated, but the updated staff record was not returned.",
    )
  }

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    phone: row.phone,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface InviteStaffUserInput {
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  role: StaffDirectoryItem["role"]
}

export interface InviteStaffUserResult {
  success: boolean
  message?: string
  userId?: string
}

export async function inviteStaffUser(
  input: InviteStaffUserInput,
): Promise<InviteStaffUserResult> {
  const { data, error } =
    await supabase.functions.invoke(
      "invite-staff-user",
      {
        body: {
          firstName:
            input.firstName.trim(),
          lastName:
            input.lastName.trim(),
          displayName:
            input.displayName.trim() ||
            null,
          email:
            input.email
              .trim()
              .toLowerCase(),
          phone:
            input.phone.trim() ||
            null,
          role: input.role,
        },
      },
    )

  if (error) {
    throw new Error(
      error.message ||
        "Unable to invite the staff member.",
    )
  }

  if (!data || data.success !== true) {
    throw new Error(
      data?.message ??
        "Unable to invite the staff member.",
    )
  }

  return data as InviteStaffUserResult
}

export async function sendStaffPasswordReset(
  staffId: string,
): Promise<void> {
  const { data, error } =
    await supabase.functions.invoke(
      "reset-staff-password",
      {
        body: {
          staffId,
        },
      },
    )

  if (error) {
    throw new Error(
      error.message ||
        "Unable to send password reset instructions.",
    )
  }

  if (!data || data.success !== true) {
    throw new Error(
      data?.message ??
        "Unable to send password reset instructions.",
    )
  }
}
