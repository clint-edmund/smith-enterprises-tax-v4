import {
  useCallback,
} from "react"

import {
  useAuth,
} from "@/features/auth/hooks/use-auth"

import {
  AuthorizationService,
} from "../authorization-service"
import type {
  Permission,
} from "../permission-types"
import {
  permissions,
} from "../permissions"

export function useAuthorization() {
  const {
    profile,
  } = useAuth()

  const role =
    profile?.role ?? null

  const hasPermission =
    useCallback(
      (
        permission: Permission,
      ): boolean => {
        if (!role) {
          return false
        }

        return AuthorizationService
          .hasPermission(
            role,
            permission,
          )
      },
      [
        role,
      ],
    )

  const hasAnyPermission =
    useCallback(
      (
        requestedPermissions:
          readonly Permission[],
      ): boolean => {
        if (!role) {
          return false
        }

        return AuthorizationService
          .hasAnyPermission(
            role,
            requestedPermissions,
          )
      },
      [
        role,
      ],
    )

  const hasAllPermissions =
    useCallback(
      (
        requestedPermissions:
          readonly Permission[],
      ): boolean => {
        if (!role) {
          return false
        }

        return AuthorizationService
          .hasAllPermissions(
            role,
            requestedPermissions,
          )
      },
      [
        role,
      ],
    )

  return {
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}