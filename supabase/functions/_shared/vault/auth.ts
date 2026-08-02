import {
  createClient,
  type SupabaseClient,
  type User,
} from "npm:@supabase/supabase-js@2"

interface VaultFunctionContext {
  serviceClient: SupabaseClient
  user: User
  clientId: string
}

function getRequiredEnvironmentVariable(
  name: string,
): string {
  const value =
    Deno.env.get(name)

  if (!value) {
    throw new Error(
      `Required server configuration is missing: ${name}.`,
    )
  }

  return value
}

function getBearerToken(
  request: Request,
): string {
  const authorizationHeader =
    request.headers.get(
      "Authorization",
    )

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith(
      "Bearer ",
    )
  ) {
    throw new Error(
      "Authentication is required.",
    )
  }

  const token =
    authorizationHeader
      .slice("Bearer ".length)
      .trim()

  if (!token) {
    throw new Error(
      "Authentication is required.",
    )
  }

  return token
}

export async function getVaultFunctionContext(
  request: Request,
): Promise<VaultFunctionContext> {
  const supabaseUrl =
    getRequiredEnvironmentVariable(
      "SUPABASE_URL",
    )

  const serviceRoleKey =
    getRequiredEnvironmentVariable(
      "SUPABASE_SERVICE_ROLE_KEY",
    )

  const serviceClient =
    createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

  const accessToken =
    getBearerToken(request)

  const {
    data: userData,
    error: userError,
  } =
    await serviceClient.auth.getUser(
      accessToken,
    )

  if (
    userError ||
    !userData.user
  ) {
    throw new Error(
      "The authenticated session is invalid or expired.",
    )
  }

  const {
    data: profile,
    error: profileError,
  } =
    await serviceClient
      .from(
        "client_portal_profiles",
      )
      .select(
        "client_id, portal_status",
      )
      .eq(
        "auth_user_id",
        userData.user.id,
      )
      .eq(
        "portal_status",
        "active",
      )
      .maybeSingle()

  if (
    profileError ||
    !profile?.client_id
  ) {
    throw new Error(
      "An active client portal profile was not found.",
    )
  }

  return {
    serviceClient,
    user: userData.user,
    clientId:
      profile.client_id,
  }
}