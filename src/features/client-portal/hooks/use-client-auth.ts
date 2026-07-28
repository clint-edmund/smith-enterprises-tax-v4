import {
  useContext,
} from "react"

import {
  ClientAuthContext,
} from "@/features/client-portal/context/client-auth-context"

export function useClientAuth() {
  const context =
    useContext(
      ClientAuthContext,
    )

  if (!context) {
    throw new Error(
      "useClientAuth must be used inside ClientAuthProvider.",
    )
  }

  return context
}