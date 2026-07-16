import type { Session, User } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

export type AppRole =
  Database["public"]["Enums"]["app_role"]

export interface StaffProfile {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  displayName: string | null
  role: AppRole
  isActive: boolean
}

export interface AuthState {
  session: Session | null
  user: User | null
  profile: StaffProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isApproved: boolean
  hasAcceptedSecurityNotice: boolean
  isCheckingSecurityNotice: boolean
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface AuthContextValue extends AuthState {
  signIn: (
    credentials: SignInCredentials,
  ) => Promise<StaffProfile>

  signOut: () => Promise<void>

  refreshProfile: () => Promise<void>

  acceptSecurityNotice: () => Promise<void>

  refreshSecurityNotice: () => Promise<void>
}