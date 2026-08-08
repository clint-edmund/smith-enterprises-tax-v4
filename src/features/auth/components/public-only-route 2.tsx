import {
  Navigate,
  Outlet,
} from "react-router-dom"

import { ApplicationLoader } from "@/components/common/application-loader"
import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function PublicOnlyRoute() {
  const {
    isLoading,
    isAuthenticated,
    isApproved,
    profile,
  } = useAuth()

  if (isLoading) {
    return (
      <ApplicationLoader message="Checking your session..." />
    )
  }

  if (!isAuthenticated) {
    return <Outlet />
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

  return (
    <Navigate
      to={appConfig.routes.dashboard}
      replace
    />
  )
}