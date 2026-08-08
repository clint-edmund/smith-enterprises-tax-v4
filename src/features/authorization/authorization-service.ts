import type {
  AppRole,
} from "@/features/auth/types/auth.types"

import type {
  Permission,
} from "./permission-types"
import {
  rolePermissions,
} from "./roles"

export class AuthorizationService {
  static hasPermission(
    role: AppRole,
    permission: Permission,
  ): boolean {
    return rolePermissions[role].includes(
      permission,
    )
  }

  static hasAnyPermission(
    role: AppRole,
    requestedPermissions:
      readonly Permission[],
  ): boolean {
    return requestedPermissions.some(
      (permission) =>
        rolePermissions[role].includes(
          permission,
        ),
    )
  }

  static hasAllPermissions(
    role: AppRole,
    requestedPermissions:
      readonly Permission[],
  ): boolean {
    return requestedPermissions.every(
      (permission) =>
        rolePermissions[role].includes(
          permission,
        ),
    )
  }
}