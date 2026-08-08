import {
  Navigate,
  Outlet,
} from "react-router-dom"



import {
  useAuthorization,
} from "@/features/authorization/hooks/use-authorization"

import type {
  Permission,
} from "@/features/authorization/permission-types"

interface PermissionRouteProps {
  permission: Permission
}

export function PermissionRoute({
  permission,
}: PermissionRouteProps) {
  const {
    hasPermission,
  } = useAuthorization()

  if (!hasPermission(permission)) {
    return (
      <Navigate
        to="/403"
        replace
      />
    )
  }

  return <Outlet />
}