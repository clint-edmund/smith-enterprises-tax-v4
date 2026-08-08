import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js"

import {
  atlasSeederConfig,
} from "../config"

export interface AuthenticatedWorkflowClient {
  supabase: SupabaseClient
  userId: string
  email: string
}

export async function createAuthenticatedWorkflowClient():
Promise<AuthenticatedWorkflowClient> {
  const supabase =
    createClient(
      atlasSeederConfig.supabaseUrl,
      atlasSeederConfig.publishableKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithPassword({
      email:
        "admin@atlas.local",

      password:
        atlasSeederConfig.developmentPassword,
    })

  if (error) {
    throw new Error(
      [
        "Unable to authenticate the Atlas workflow client.",
        error.message,
      ].join("\n"),
    )
  }

  if (
    !data.user ||
    !data.user.email
  ) {
    throw new Error(
      "Atlas workflow authentication did not return a valid user.",
    )
  }

  return {
    supabase,
    userId:
      data.user.id,

    email:
      data.user.email,
  }
}