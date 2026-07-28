import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom"

import {
  useClientAuth,
} from "@/features/client-portal/hooks/use-client-auth"

export function ClientPortalGuard() {
  const location =
    useLocation()

  const {
    isAuthenticated,
    isLoading,
  } =
    useClientAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading your client portal...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/client/login"
        replace
        state={{
          from: location,
        }}
      />
    )
  }

  return <Outlet />
}