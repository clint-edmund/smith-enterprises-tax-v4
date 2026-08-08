import {
  supabase,
} from "@/services/supabase"

import type {
  ClientDashboard,
  ClientDashboardReturnStatus,
  ClientDashboardReturnType,
  ClientDashboardTaxForm,
} from "@/features/client-portal/types/client-dashboard.types"

interface ClientDashboardDatabaseRecord {
  client_id: string

  client_number: number

  first_name: string

  preferred_name: string | null

  current_return_id: string | null

  current_tax_year: number | null

  current_return_type:
    | ClientDashboardReturnType
    | null

  current_tax_form:
    | ClientDashboardTaxForm
    | null

  current_return_status:
    | ClientDashboardReturnStatus
    | null

  current_return_updated_at: string | null

  assigned_preparer_name: string | null

  preparation_fee: number | string | null

  discount_amount: number | string | null

  total_payments: number | string | null

  outstanding_balance: number | string | null

  document_count: number | string | null

  recent_document_id: string | null

  recent_document_name: string | null

  recent_document_category: string | null

  recent_document_status: string | null

  recent_document_uploaded_at: string | null
}

function toNumber(
  value: number | string | null,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0
  }

  if (typeof value === "string") {
    const parsedValue = Number(value)

    return Number.isFinite(parsedValue)
      ? parsedValue
      : 0
  }

  return 0
}

function getDashboardRecord(
  data:
    | ClientDashboardDatabaseRecord
    | ClientDashboardDatabaseRecord[]
    | null,
): ClientDashboardDatabaseRecord {
  const record = Array.isArray(data)
    ? data[0]
    : data

  if (!record) {
    throw new Error(
      "The client dashboard could not be loaded.",
    )
  }

  return record
}

function mapClientDashboard(
  record: ClientDashboardDatabaseRecord,
): ClientDashboard {
  return {
    clientId:
      record.client_id,

    clientNumber:
      record.client_number,

    firstName:
      record.first_name,

    preferredName:
      record.preferred_name,

    currentReturnId:
      record.current_return_id,

    currentTaxYear:
      record.current_tax_year,

    currentReturnType:
      record.current_return_type,

    currentTaxForm:
      record.current_tax_form,

    currentReturnStatus:
      record.current_return_status,

    currentReturnUpdatedAt:
      record.current_return_updated_at,

    assignedPreparerName:
      record.assigned_preparer_name,

    preparationFee:
      toNumber(
        record.preparation_fee,
      ),

    discountAmount:
      toNumber(
        record.discount_amount,
      ),

    totalPayments:
      toNumber(
        record.total_payments,
      ),

    outstandingBalance:
      toNumber(
        record.outstanding_balance,
      ),

    documentCount:
      toNumber(
        record.document_count,
      ),

    recentDocumentId:
      record.recent_document_id,

    recentDocumentName:
      record.recent_document_name,

    recentDocumentCategory:
      record.recent_document_category,

    recentDocumentStatus:
      record.recent_document_status,

    recentDocumentUploadedAt:
      record.recent_document_uploaded_at,
  }
}

export function getClientDashboardErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim() !== ""
  ) {
    return error.message
  }

  return "The client dashboard could not be loaded."
}

export async function getClientDashboard():
Promise<ClientDashboard> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "get_client_portal_dashboard",
  )

  if (error) {
    throw new Error(error.message)
  }

  const record = getDashboardRecord(
    data as
      | ClientDashboardDatabaseRecord[]
      | null,
  )

  return mapClientDashboard(record)
}