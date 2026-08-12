import {
  getStaffAdminFunctionContext,
} from "../_shared/staff/auth.ts"

import {
  corsHeaders,
  errorResponse,
  jsonResponse,
} from "../_shared/staff/http.ts"

interface ResetStaffPasswordRequest {
  staffId?: unknown
}

function normalizeStaffId(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      "A staff identifier is required.",
    )
  }

  return value.trim()
}

Deno.serve(
  async (
    request: Request,
  ): Promise<Response> => {
    if (
      request.method === "OPTIONS"
    ) {
      return new Response(
        "ok",
        {
          headers: corsHeaders,
        },
      )
    }

    if (
      request.method !== "POST"
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
        ResetStaffPasswordRequest

      try {
        body =
          await request.json()
      } catch {
        throw new Error(
          "The request body must contain valid JSON.",
        )
      }

      const staffId =
        normalizeStaffId(
          body.staffId,
        )

      const {
        data: targetStaff,
        error: targetError,
      } =
        await serviceClient
          .from("profiles")
          .select(
            "id, email, role, is_active",
          )
          .eq(
            "id",
            staffId,
          )
          .maybeSingle()

      if (
        targetError ||
        !targetStaff
      ) {
        throw new Error(
          "The staff account was not found.",
        )
      }

      const redirectTo =
        Deno.env.get(
          "STAFF_PASSWORD_RESET_REDIRECT_URL",
        )

      if (!redirectTo) {
        throw new Error(
          "Required server configuration is missing: STAFF_PASSWORD_RESET_REDIRECT_URL.",
        )
      }

      const {
        error: resetError,
      } =
        await serviceClient.auth
          .resetPasswordForEmail(
            targetStaff.email,
            {
              redirectTo,
            },
          )

      if (resetError) {
        throw new Error(
          "The password reset email could not be sent.",
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
              targetStaff.id,

            action:
              "password_reset_requested",

            outcome:
              "success",

            new_role:
              targetStaff.role,

            new_is_active:
              targetStaff.is_active,

            target_email:
              targetStaff.email,

            metadata: {
              request_id:
                requestId,

              reset_method:
                "email",
            },
          })

      if (auditError) {
        console.error(
          `Password reset audit event could not be written. Request ID: ${requestId}.`,
          auditError,
        )
      }

      return jsonResponse(
        {
          success: true,
          requestId,
        },
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The password reset request could not be completed."

      console.error(
        `Staff password reset failed. Request ID: ${requestId}. Error: ${message}`,
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