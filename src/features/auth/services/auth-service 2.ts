import type {
  Session,
  User,
} from "@supabase/supabase-js"

import type {
  SignInCredentials,
  StaffProfile,
} from "@/features/auth/types/auth.types"
import { supabase } from "@/services/supabase"

interface AccessStatusRow {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  role: StaffProfile["role"]
  is_active: boolean
}

function mapStaffProfile(
  row: AccessStatusRow,
): StaffProfile {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    role: row.role,
    isActive: row.is_active,
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

export async function getCurrentProfile(): Promise<StaffProfile | null> {
  const { data, error } = await supabase.rpc(
    "get_current_access_status",
  )

  if (error) {
    throw error
  }

  const profileRow = data?.[0]

  if (!profileRow) {
    return null
  }

  return mapStaffProfile(profileRow)
}

export async function signInWithPassword(
  credentials: SignInCredentials,
): Promise<Session> {
  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  })

  if (error) {
    throw error
  }

  if (!session) {
    throw new Error(
      "Supabase did not return an authenticated session.",
    )
  }

  return session
}

export async function signOutCurrentUser(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}