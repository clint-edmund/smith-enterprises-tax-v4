import {
  Navigate,
  useParams,
} from "react-router-dom"

import {
  appConfig,
  getReturnDetailsRoute,
} from "@/config/app-config"

export function LegacyReturnWorkspaceRedirect() {
  const { returnId } = useParams()

  if (!returnId) {
    return (
      <Navigate
        to={appConfig.routes.returns}
        replace
      />
    )
  }

  return (
    <Navigate
      to={getReturnDetailsRoute(
        returnId,
      )}
      replace
    />
  )
}