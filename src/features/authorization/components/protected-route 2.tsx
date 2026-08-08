import type { ReactNode } from "react";

import { AccessDenied } from "./access-denied";

import { useAuthorization } from "../hooks/use-authorization";
import type { Permission } from "../permission-types";

interface ProtectedRouteProps {
  permission: Permission;
  children: ReactNode;
}

export function ProtectedRoute({
  permission,
  children,
}: ProtectedRouteProps) {
  const { hasPermission } =
    useAuthorization();

  if (!hasPermission(permission)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}