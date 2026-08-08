import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom"

import { ApplicationLoader } from "@/components/common/application-loader"
import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function ProtectedRoute() {
  const location = useLocation()

  const {
    isLoading,
    isAuthenticated,
    isApproved,
    profile,
  } = useAuth()

  if (isLoading) {
    return (
      <ApplicationLoader message="Verifying your session..." />
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={appConfig.routes.login}
        replace
        state={{
          from: location.pathname,
        }}
      />
    )
  }

  if (!profile) {
    return (
      <Navigate
        to={appConfig.routes.accountError}
        replace
      />
    )
  }

  if (!isApproved) {
    return (
      <Navigate
        to={appConfig.routes.pendingApproval}
        replace
      />
    )
  }

  return <Outlet />
}