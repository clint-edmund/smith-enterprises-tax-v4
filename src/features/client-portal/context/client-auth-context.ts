import {
  createContext,
} from "react"

import type {
  Session,
  User,
} from "@supabase/supabase-js"

import type {
  ClientSignInCredentials,
} from "@/features/client-portal/types/client-auth.types"

import type {
  ClientProfile,
} from "@/features/client-portal/types/client-profile.types"

export interface ClientAuthContextValue {
  session: Session | null

  user: User | null

  profile: ClientProfile | null

  isLoading: boolean

  isAuthenticated: boolean

  signIn: (
    credentials: ClientSignInCredentials,
  ) => Promise<ClientProfile>

  signOut: () => Promise<void>

  refreshProfile: () => Promise<void>
}

export const ClientAuthContext =
  createContext<ClientAuthContextValue | undefined>(
    undefined,
  )