import {
  getStaffAdminFunctionContext,
} from "../_shared/staff/auth.ts"

import {
  corsHeaders,
  errorResponse,
  jsonResponse,
} from "../_shared/staff/http.ts"

type StaffRole =
  | "administrator"
  | "manager"
  | "preparer"
  | "reviewer"
  | "receptionist"
  | "read_only"

interface InviteStaffUserRequest {
  email?: unknown
  firstName?: unknown
  lastName?: unknown
  displayName?: unknown
  phone?: unknown
  role?: unknown
}

const allowedRoles =
  new Set<StaffRole>([
    "administrator",
    "manager",
    "preparer",
    "reviewer",
    "receptionist",
    "read_only",
  ])

function normalizeRequiredText(
  value: unknown,
  fieldName: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `${fieldName} is required.`,
    )
  }

  return value.trim()
}

function normalizeOptionalText(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null
  }

  const normalized =
    value.trim()

  return normalized || null
}

function normalizeEmail(
  value: unknown,
): string {
  const email =
    normalizeRequiredText(
      value,
      "Email",
    ).toLowerCase()

  const basicEmailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (
    !basicEmailPattern.test(
      email,
    )
  ) {
    throw new Error(
      "A valid email address is required.",
    )
  }

  return email
}

function normalizeRole(
  value: unknown,
): StaffRole {
  if (
    typeof value !== "string" ||
    !allowedRoles.has(
      value as StaffRole,
    )
  ) {
    throw new Error(
      "A valid staff role is required.",
    )
  }

  return value as StaffRole
}

Deno.serve(
  async (
    request: Request,
  ): Promise<Response> => {
    if (
      request.method ===
      "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          headers:
            corsHeaders,
        },
      )
    }

    if (
      request.method !==
      "POST"
    ) {
      return errorResponse(
        "Method not allowed.",
        405,
      )
    }

    const requestId =
      crypto.randomUUID()

    try {
      const {
        serviceClient,
        user: actorUser,
        } =
        await getStaffAdminFunctionContext(
            request,
        )

      let body:
        InviteStaffUserRequest

      try {
        body =
          await request.json()
      } catch {
        throw new Error(
          "The request body must contain valid JSON.",
        )
      }

      const email =
        normalizeEmail(
          body.email,
        )

      const firstName =
        normalizeRequiredText(
          body.firstName,
          "First name",
        )

      const lastName =
        normalizeRequiredText(
          body.lastName,
          "Last name",
        )

      const displayName =
        normalizeOptionalText(
          body.displayName,
        ) ??
        `${firstName} ${lastName}`

      const phone =
        normalizeOptionalText(
          body.phone,
        )

      const role =
        normalizeRole(
          body.role,
        )

      const {
        data: existingProfile,
        error:
          existingProfileError,
      } =
        await serviceClient
          .from("profiles")
          .select("id, email")
          .ilike(
            "email",
            email,
          )
          .maybeSingle()

      if (existingProfileError) {
        throw new Error(
          "The staff directory could not be checked for duplicate accounts.",
        )
      }

      if (existingProfile) {
        return errorResponse(
          "A staff account already exists for this email address.",
          409,
          requestId,
        )
      }

      const redirectTo =
        Deno.env.get(
          "STAFF_INVITE_REDIRECT_URL",
        )

      if (!redirectTo) {
        throw new Error(
          "Required server configuration is missing: STAFF_INVITE_REDIRECT_URL.",
        )
      }

      const {
        data: inviteData,
        error: inviteError,
      } =
        await serviceClient
          .auth
          .admin
          .inviteUserByEmail(
            email,
            {
              redirectTo,
              data: {
                first_name:
                  firstName,
                last_name:
                  lastName,
                display_name:
                  displayName,
              },
            },
          )

      if (
        inviteError ||
        !inviteData.user
      ) {
        const message =
          inviteError?.message ??
          "The staff invitation could not be created."

        if (
          message
            .toLowerCase()
            .includes(
              "already",
            )
        ) {
          return errorResponse(
            "An authentication account already exists for this email address.",
            409,
            requestId,
          )
        }

        throw new Error(
          "The staff invitation could not be created.",
        )
      }

      const newUserId =
        inviteData.user.id

      const {
        data: updatedProfile,
        error: profileUpdateError,
      } =
        await serviceClient
          .from("profiles")
          .update({
            role,
            phone,
          })
          .eq(
            "id",
            newUserId,
          )
          .select(
            [
              "id",
              "email",
              "first_name",
              "last_name",
              "display_name",
              "phone",
              "role",
              "is_active",
              "created_at",
              "updated_at",
            ].join(","),
          )
          .single()

      if (
        profileUpdateError ||
        !updatedProfile
      ) {
        throw new Error(
          "The staff authentication account was created, but the staff profile could not be finalized.",
        )
      }

      const {
        error: auditError,
        } =
        await serviceClient
            .from(
            "staff_admin_audit_events",
            )
            .insert({
            actor_user_id:
                actorUser.id,

            target_staff_id:
                updatedProfile.id,

            action:
                "staff_invited",

            outcome:
                "success",

            new_role:
                updatedProfile.role,

            new_is_active:
                updatedProfile.is_active,

            target_email:
                updatedProfile.email,

            metadata: {
                request_id:
                requestId,

                invitation_method:
                "email",

                initial_role:
                updatedProfile.role,
            },
            })

        if (auditError) {
        console.error(
            `Staff invitation audit event could not be written. Request ID: ${requestId}.`,
            auditError,
        )
        }

      return jsonResponse(
        {
          success: true,
          staff: {
            id:
              updatedProfile.id,
            email:
              updatedProfile.email,
            firstName:
              updatedProfile.first_name,
            lastName:
              updatedProfile.last_name,
            displayName:
              updatedProfile.display_name,
            phone:
              updatedProfile.phone,
            role:
              updatedProfile.role,
            isActive:
              updatedProfile.is_active,
            createdAt:
              updatedProfile.created_at,
            updatedAt:
              updatedProfile.updated_at,
          },
          requestId,
        },
        201,
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The staff invitation could not be created."

      console.error(
        `Staff invitation failed. Request ID: ${requestId}. Error: ${message}`,
        )

      const status =
        message.includes(
          "Authentication",
        ) ||
        message.includes(
          "session",
        )
          ? 401
          : message.includes(
                "Administrator access",
              ) ||
              message.includes(
                "not active",
              )
            ? 403
            : 400

      return errorResponse(
        message,
        status,
        requestId,
      )
    }
  },
)