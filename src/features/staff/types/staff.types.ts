import type {
  Json,
} from "@/types/database.types"

import type {
  AppRole,
} from "@/features/auth/types/auth.types"

export interface StaffDirectoryItem {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  displayName: string | null
  phone: string | null
  role: AppRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StaffAdminAuditEvent {
  id: string
  actorUserId: string
  actorEmail: string
  actorDisplayName: string
  targetStaffId: string | null
  targetEmail: string | null
  action: string
  outcome: string
  previousRole: AppRole | null
  newRole: AppRole | null
  previousIsActive: boolean | null
  newIsActive: boolean | null
  metadata: Json
  createdAt: string
}
