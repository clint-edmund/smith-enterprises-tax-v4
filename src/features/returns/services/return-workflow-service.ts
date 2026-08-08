import { supabase } from "@/services/supabase"

import type {
  LogReturnWorkflowRequest,
} from "../types/return-workflow.types"

export async function logReturnWorkflow(
  request: LogReturnWorkflowRequest
): Promise<string> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "log_return_workflow",
    {
      requested_return_id:
        request.taxReturnId,

      requested_event_type:
        request.eventType,

      requested_event_label:
        request.eventLabel,

      requested_event_description:
        request.eventDescription,

      requested_is_client_visible:
        request.isClientVisible ?? true,

      requested_event_data:
        request.eventData ?? {},

      requested_occurred_at:
        request.occurredAt ?? new Date().toISOString(),
    }
  )

  if (error) {
    throw new Error(
      `Unable to record return workflow activity: ${error.message}`
    )
  }

  if (!data) {
    throw new Error(
      "The workflow activity was not recorded."
    )
  }

  return data
}

interface LogPaymentReceivedRequest {
  taxReturnId: string
  paymentId: string
  amount: number
  paymentMethod: string
  paymentDate: string
  referenceNumber?: string | null
}

export async function logPaymentReceived(
  request: LogPaymentReceivedRequest
): Promise<string> {
  const formattedAmount =
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
      }
    ).format(request.amount)

  return logReturnWorkflow({
    taxReturnId:
      request.taxReturnId,

    eventType:
      "payment_received",

    eventLabel:
      "Payment received",

    eventDescription:
      `${formattedAmount} payment received.`,

    isClientVisible:
      true,

    occurredAt:
      request.paymentDate,

    eventData: {
      payment_id:
        request.paymentId,

      amount:
        request.amount,

      payment_method:
        request.paymentMethod,

      payment_date:
        request.paymentDate,

      reference_number:
        request.referenceNumber ?? null,
    },
  })
}

interface LogDocumentUploadedRequest {
  taxReturnId: string
  documentId: string
  originalFileName: string
  category: string
  versionNumber?: number
  uploadedAt: string
}

export async function logDocumentUploaded(
  request: LogDocumentUploadedRequest
): Promise<string> {
  const isNewVersion =
    (request.versionNumber ?? 1) > 1

  return logReturnWorkflow({
    taxReturnId:
      request.taxReturnId,

    eventType:
      isNewVersion
        ? "document_version_uploaded"
        : "document_uploaded",

    eventLabel:
      isNewVersion
        ? "New document version uploaded"
        : "Document uploaded",

    eventDescription:
      isNewVersion
        ? `A new version of ${request.originalFileName} was uploaded.`
        : `${request.originalFileName} was uploaded.`,

    isClientVisible:
      true,

    occurredAt:
      request.uploadedAt,

    eventData: {
      document_id:
        request.documentId,

      original_file_name:
        request.originalFileName,

      category:
        request.category,

      version_number:
        request.versionNumber ?? 1,
    },
  })
}