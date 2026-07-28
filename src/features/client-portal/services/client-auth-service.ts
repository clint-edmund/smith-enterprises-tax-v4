import type {
  Session,
} from "@supabase/supabase-js"

import { supabase } from "@/services/supabase"

import type {
  ClientSignInCredentials,
} from "@/features/client-portal/types/client-auth.types"

export async function clientSignInWithPassword(
  credentials: ClientSignInCredentials,
): Promise<Session> {
  const email =
    credentials.email
      .trim()
      .toLowerCase()

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithPassword({
      email,
      password:
        credentials.password,
    })

  if (error) {
    throw error
  }

  if (!data.session) {
    throw new Error(
      "The client portal session could not be created.",
    )
  }

  return data.session
}

export async function clientSignOut(): Promise<void> {
  const {
    error,
  } =
    await supabase.auth.signOut()

  if (error) {
    throw error
  }
}