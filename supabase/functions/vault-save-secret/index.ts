import {
  getVaultFunctionContext,
} from "../_shared/vault/auth.ts"
import {
  writeVaultAuditEvent,
} from "../_shared/vault/audit.ts"
import {
  encryptVaultValue,
} from "../_shared/vault/crypto.ts"
import {
  corsHeaders,
  errorResponse,
  jsonResponse,
} from "../_shared/vault/http.ts"
import {
  maskSecret,
} from "../_shared/vault/masking.ts"
import type {
  SaveVaultSecretRequest,
  SaveVaultSecretResponse,
  VaultSecretType,
} from "../_shared/vault/types.ts"
import {
  normalizeSecretValue,
  validateSecret,
} from "../_shared/vault/validation.ts"

const allowedSecretTypes =
  new Set<VaultSecretType>([
    "social_security_number",
    "dependent_social_security_number",
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

    let dependentId:
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
        SaveVaultSecretRequest

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

      dependentId =
        body.dependentId?.trim() ||
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

      if (
        typeof body.plainTextValue !==
        "string"
      ) {
        throw new Error(
          "A secure value is required.",
        )
      }

      if (
        secretType ===
          "dependent_social_security_number" &&
        !dependentId
      ) {
        throw new Error(
          "A dependent identifier is required.",
        )
      }

      if (
        dependentId &&
        secretType !==
          "dependent_social_security_number"
      ) {
        throw new Error(
          "The requested secure-information type is not supported for a dependent.",
        )
      }

      if (
        dependentId &&
        !organizerId
      ) {
        throw new Error(
          "An organizer identifier is required for dependent secure information.",
        )
      }

      const normalizedValue =
        normalizeSecretValue(
          body.plainTextValue,
          secretType,
        )

      validateSecret(
        normalizedValue,
        secretType,
      )

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
              "id, client_id",
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
              dependentId,
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
                  "save_secret",
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

      if (dependentId) {
        const {
          data: dependent,
          error:
            dependentError,
        } =
          await serviceClient
            .from(
              "client_tax_organizer_dependents",
            )
            .select(
              "id, organizer_id",
            )
            .eq(
              "id",
              dependentId,
            )
            .eq(
              "organizer_id",
              organizerId,
            )
            .maybeSingle()

        if (
          dependentError ||
          !dependent
        ) {
          await writeVaultAuditEvent(
            {
              serviceClient,
              clientId,
              organizerId,
              dependentId,
              secretType,
              actorUserId,
              action:
                "access_denied",
              outcome:
                "denied",
              reason:
                "Dependent ownership verification failed.",
              source:
                "client_portal",
              requestId,
              request,
              metadata: {
                operation:
                  "save_secret",
              },
            },
          )

          return errorResponse(
            "The requested dependent was not found.",
            403,
            requestId,
          )
        }
      }

      const {
        data: keyRows,
        error: keyError,
      } =
        await serviceClient.rpc(
          "get_active_vault_key_version",
        )

      const keyRecord =
        keyRows?.[0]

      if (
        keyError ||
        !keyRecord
      ) {
        throw new Error(
          "Secure storage is temporarily unavailable.",
        )
      }

      const encrypted =
        await encryptVaultValue(
          normalizedValue,
          keyRecord.key_version,
        )

      const maskedValue =
        maskSecret(
          normalizedValue,
          secretType,
        )

      const {
        data: storedRows,
        error: storeError,
      } =
        await serviceClient.rpc(
          "store_vault_secret_v2",
          {
            requested_client_id:
              clientId,

            requested_organizer_id:
              organizerId,

            requested_dependent_id:
              dependentId,

            requested_secret_type:
              secretType,

            requested_encrypted_value:
              encrypted.encryptedValue,

            requested_initialization_vector:
              encrypted.initializationVector,

            requested_authentication_tag:
              encrypted.authenticationTag,

            requested_key_version:
              keyRecord.key_version,

            requested_masked_value:
              maskedValue,

            requested_actor_user_id:
              actorUserId,
          },
        )

      const storedRecord =
        storedRows?.[0]

      if (
        storeError ||
        !storedRecord
      ) {
        throw new Error(
          "The secure information could not be stored.",
        )
      }

      await writeVaultAuditEvent(
        {
          serviceClient,
          vaultSecretId:
            storedRecord.vault_secret_id,
          clientId,
          organizerId,
          dependentId,
          secretType,
          actorUserId,
          action:
            storedRecord.replaced_existing_secret
              ? "replace"
              : "create",
          outcome:
            "success",
          reason:
            dependentId
              ? "Dependent secure information submitted through the client portal."
              : "Secure information submitted through the client portal.",
          source:
            "client_portal",
          requestId,
          request,
          metadata: {
            key_version:
              storedRecord.key_version,

            status:
              storedRecord.status,

            replaced_existing:
              storedRecord.replaced_existing_secret,

            ownership_scope:
              dependentId
                ? "dependent"
                : organizerId
                  ? "organizer"
                  : "client",
          },
        },
      )

      const response:
        SaveVaultSecretResponse = {
          success: true,

          vaultSecretId:
            storedRecord.vault_secret_id,

          maskedValue:
            storedRecord.masked_value,

          keyVersion:
            storedRecord.key_version,

          status:
            storedRecord.status,

          replacedExistingSecret:
            storedRecord.replaced_existing_secret,

          updatedAt:
            storedRecord.updated_at,

          requestId,
        }

      return jsonResponse(
        response,
        200,
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Secure information could not be saved."

      if (serviceClient) {
        await writeVaultAuditEvent(
          {
            serviceClient,
            clientId,
            organizerId,
            dependentId,
            secretType,
            actorUserId,
            action:
              "encrypt_failed",
            outcome:
              "failure",
            reason:
              "The secure save operation failed.",
            source:
              "edge_function",
            requestId,
            request,
            metadata: {
              operation:
                "save_secret",

              ownership_scope:
                dependentId
                  ? "dependent"
                  : organizerId
                    ? "organizer"
                    : "client",
            },
          },
        )
      }

      console.error(
        `Vault save failed. Request ID: ${requestId}`,
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
                "not found",
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