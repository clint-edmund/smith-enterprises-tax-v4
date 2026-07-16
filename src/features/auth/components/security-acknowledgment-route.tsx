import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom"

import { ApplicationLoader } from "@/components/common/application-loader"
import { appConfig } from "@/config/app-config"
import { useAuth } from "@/features/auth/hooks/use-auth"

export function SecurityAcknowledgmentRoute() {
  const location = useLocation()

  const {
    isCheckingSecurityNotice,
    hasAcceptedSecurityNotice,
  } = useAuth()

  if (isCheckingSecurityNotice) {
    return (
      <ApplicationLoader message="Checking security acknowledgment..." />
    )
  }

  if (!hasAcceptedSecurityNotice) {
    return (
      <Navigate
        to={
          appConfig.routes
            .securityAcknowledgment
        }
        replace
        state={{
          from: location.pathname,
        }}
      />
    )
  }

  return <Outlet />
}