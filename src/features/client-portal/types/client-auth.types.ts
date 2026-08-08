import type {
  Session,
  User,
} from "@supabase/supabase-js"

import type {
  ClientProfile,
} from "./client-profile.types"

export interface ClientSignInCredentials {
  email: string

  password: string
}

export interface ClientAuthState {
  session: Session | null

  user: User | null

  profile: ClientProfile | null

  isLoading: boolean

  isAuthenticated: boolean
}

export interface ClientAuthContextValue
  extends ClientAuthState {

  signIn: (
    credentials: ClientSignInCredentials,
  ) => Promise<ClientProfile>

  signOut: () => Promise<void>

  refreshProfile: () => Promise<void>
}