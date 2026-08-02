import {
  getVaultFunctionContext,
} from "../_shared/vault/auth.ts"
import {
  writeVaultAuditEvent,
} from "../_shared/vault/audit.ts"
import {
  corsHeaders,
  errorResponse,
  jsonResponse,
} from "../_shared/vault/http.ts"
import type {
  GetVaultMetadataRequest,
  GetVaultMetadataResponse,
  VaultSecretMetadata,
  VaultSecretType,
} from "../_shared/vault/types.ts"

const allowedSecretTypes =
  new Set<VaultSecretType>([
    "social_security_number",
    "itin",
    "drivers_license",
    "passport",
    "state_identification",
    "routing_number",
    "bank_account_number",
    "identity_protection_pin",
    "employer_identification_number",
  ])

function isVaultSecretType(
  value: unknown,
): value is VaultSecretType {
  return (
    typeof value === "string" &&
    allowedSecretTypes.has(
      value as VaultSecretType,
    )
  )
}

Deno.serve(
  async (
    request: Request,
  ): Promise<Response> => {
    if (request.method === "OPTIONS") {
      return new Response(
        "ok",
        {
          headers: corsHeaders,
        },
      )
    }

    if (request.method !== "POST") {
      return errorResponse(
        "Method not allowed.",
        405,
      )
    }

    const requestId =
      crypto.randomUUID()

    let serviceClient:
      Awaited<
        ReturnType<
          typeof getVaultFunctionContext
        >
      >["serviceClient"] |
      null = null

    let actorUserId:
      string | null = null

    let clientId:
      string | null = null

    let organizerId:
      string | null = null

    let secretType:
      VaultSecretType | null =
        null

    try {
      const context =
        await getVaultFunctionContext(
          request,
        )

      serviceClient =
        context.serviceClient

      actorUserId =
        context.user.id

      clientId =
        context.clientId

      let body:
        GetVaultMetadataRequest

      try {
        body =
          await request.json()
      } catch {
        throw new Error(
          "The request body must contain valid JSON.",
        )
      }

      organizerId =
        body.organizerId?.trim() ||
        null

      if (
        !isVaultSecretType(
          body.secretType,
        )
      ) {
        throw new Error(
          "The requested secure-information type is invalid.",
        )
      }

      secretType =
        body.secretType

      if (organizerId) {
        const {
          data: organizer,
          error:
            organizerError,
        } =
          await serviceClient
            .from(
              "client_tax_organizers",
            )
            .select(
              "id",
            )
            .eq(
              "id",
              organizerId,
            )
            .eq(
              "client_id",
              clientId,
            )
            .maybeSingle()

        if (
          organizerError ||
          !organizer
        ) {
          await writeVaultAuditEvent(
            {
              serviceClient,
              clientId,
              organizerId,
              secretType,
              actorUserId,
              action:
                "access_denied",
              outcome:
                "denied",
              reason:
                "Organizer ownership verification failed.",
              source:
                "client_portal",
              requestId,
              request,
              metadata: {
                operation:
                  "get_metadata",
              },
            },
          )

          return errorResponse(
            "The requested organizer was not found.",
            403,
            requestId,
          )
        }
      }

      let query =
        serviceClient
          .from(
            "vault_secrets",
          )
          .select(
            [
              "id",
              "secret_type",
              "masked_value",
              "status",
              "key_version",
              "verified_at",
              "created_at",
              "updated_at",
            ].join(","),
          )
          .eq(
            "client_id",
            clientId,
          )
          .eq(
            "secret_type",
            secretType,
          )
          .is(
            "archived_at",
            null,
          )

      if (organizerId) {
        query =
          query.eq(
            "organizer_id",
            organizerId,
          )
      } else {
        query =
          query.is(
            "organizer_id",
            null,
          )
      }

      const {
        data: record,
        error: recordError,
      } =
        await query.maybeSingle()

      if (recordError) {
        throw new Error(
          "Secure-information metadata could not be loaded.",
        )
      }

      if (!record) {
        const response:
          GetVaultMetadataResponse = {
            success: true,
            hasValue: false,
            secret: null,
            requestId,
          }

        return jsonResponse(
          response,
        )
      }

      const secret:
        VaultSecretMetadata = {
          vaultSecretId:
            record.id,

          secretType:
            record.secret_type as VaultSecretType,

          maskedValue:
            record.masked_value,

          status:
            record.status,

          keyVersion:
            record.key_version,

          hasValue: true,

          verified:
            record.status ===
            "verified",

          verifiedAt:
            record.verified_at,

          createdAt:
            record.created_at,

          updatedAt:
            record.updated_at,
        }

      await writeVaultAuditEvent(
        {
          serviceClient,
          vaultSecretId:
            record.id,
          clientId,
          organizerId,
          secretType,
          actorUserId,
          action:
            "view_masked",
          outcome:
            "success",
          reason:
            "Masked secure-information metadata loaded in the client portal.",
          source:
            "client_portal",
          requestId,
          request,
          metadata: {
            operation:
              "get_metadata",

            status:
              record.status,
          },
        },
      )

      const response:
        GetVaultMetadataResponse = {
          success: true,
          hasValue: true,
          secret,
          requestId,
        }

      return jsonResponse(
        response,
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Secure-information metadata could not be loaded."

      if (serviceClient) {
        await writeVaultAuditEvent(
          {
            serviceClient,
            clientId,
            organizerId,
            secretType,
            actorUserId,
            action:
              "access_denied",
            outcome:
              "failure",
            reason:
              "The metadata-read operation failed.",
            source:
              "edge_function",
            requestId,
            request,
            metadata: {
              operation:
                "get_metadata",
            },
          },
        )
      }

      console.error(
        `Vault metadata request failed. Request ID: ${requestId}`,
      )

      const status =
        message.includes(
          "Authentication",
        ) ||
        message.includes(
          "session",
        )
          ? 401
          : 400

      return errorResponse(
        message,
        status,
        requestId,
      )
    }
  },
)