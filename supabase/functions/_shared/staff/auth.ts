import {
  createClient,
  type SupabaseClient,
  type User,
} from "npm:@supabase/supabase-js@2"

interface StaffAdminFunctionContext {
  serviceClient: SupabaseClient
  user: User
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

export async function getStaffAdminFunctionContext(
  request: Request,
): Promise<StaffAdminFunctionContext> {
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
      .from("profiles")
      .select(
        "id, role, is_active",
      )
      .eq(
        "id",
        userData.user.id,
      )
      .maybeSingle()

  if (
    profileError ||
    !profile
  ) {
    throw new Error(
      "An active staff profile was not found.",
    )
  }

  if (!profile.is_active) {
    throw new Error(
      "The staff account is not active.",
    )
  }

  if (
    profile.role !==
    "administrator"
  ) {
    throw new Error(
      "Administrator access is required.",
    )
  }

  return {
    serviceClient,
    user: userData.user,
  }
}